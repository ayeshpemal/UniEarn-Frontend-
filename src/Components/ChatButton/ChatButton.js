import React, { useState, useEffect } from "react";
import { BellIcon } from "@heroicons/react/24/solid";
import { connectWebSocket, disconnectWebSocket } from "../../services/notificationService";
import { jwtDecode } from "jwt-decode";
import { v4 as uuidv4 } from "uuid"; // Add uuid package for generating unique IDs

const ChatButton = () => {
    const [messageCount, setMessageCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [activeTab, setActiveTab] = useState("updates");
    const [jobNotifications, setJobNotifications] = useState([]);
    const [systemNotifications, setSystemNotifications] = useState([]);
    const [updateNotifications, setUpdateNotifications] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalNotifications, setTotalNotifications] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("JWT Token not found");
            return;
        }

        let username = null;
        let userId = null;
        let role = null;
        try {
            const decodedToken = jwtDecode(token);
            username = decodedToken.sub;
            userId = decodedToken.user_id || decodedToken.sub;
            role = decodedToken.role || "";
            console.log(`Decoded username: ${username}, role: ${role}, userId: ${userId}`);
        } catch (error) {
            console.error("Error decoding JWT token:", error);
            return;
        }

        if (!username || !userId) {
            console.error("Username or userId is not available in the token.");
            return;
        }

        // Fetch initial notifications when component mounts
        const fetchNotifications = async () => {
            try {
                // Fetch update notifications for all users (load immediately on mount)
                console.log("Fetching update notifications for userId:", userId);
                const updateResponse = await fetch(
                    `http://localhost:8100/api/v1/updateNotification/get-update-notifications/${userId}?page=0&size=10`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                const updateData = await updateResponse.json();
                console.log("Update notifications response:", updateData);
                if (updateData.code === 200) {
                    const sortedUpdateNotifications = updateData.data.notifications
                        .map((notif) => ({ ...notif, type: "update" }))
                        .sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate));
                    setUpdateNotifications(sortedUpdateNotifications);
                    const unreadUpdateCount = sortedUpdateNotifications.filter(
                        (notif) => !notif.isRead
                    ).length;
                    setMessageCount((prev) => prev + unreadUpdateCount);
                    console.log("Updated updateNotifications:", sortedUpdateNotifications);
                } else {
                    console.error("Failed to fetch update notifications:", updateData);
                }

                // Fetch job notifications only if role is not "EMPLOYER"
                if (role !== "EMPLOYER") {
                    console.log("Fetching job notifications for userId:", userId);
                    const jobResponse = await fetch(
                        `http://localhost:8100/api/v1/Notification/get-job-notifications/${userId}?page=${currentPage}&size=${itemsPerPage}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );
                    const jobData = await jobResponse.json();
                    console.log("Job notifications response:", jobData);
                    if (jobData.code === 200) {
                        const sortedJobNotifications = jobData.data.notifications
                            .map((notif) => ({ ...notif, type: "job" }))
                            .sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate));
                        setJobNotifications(sortedJobNotifications);
                        setTotalNotifications(jobData.data.totalNotifications);
                        const unreadJobCount = sortedJobNotifications.filter(
                            (notif) => !notif.isRead
                        ).length;
                        setMessageCount((prev) => prev + unreadJobCount);
                        console.log("Updated jobNotifications:", sortedJobNotifications);
                    } else {
                        console.error("Failed to fetch job notifications:", jobData);
                    }
                }
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchNotifications();

        // Set up WebSocket
        connectWebSocket(username, (notification, type) => {
            console.log("Received WebSocket notification:", notification, "with type:", type);
            let newNotification = { ...notification, type: type || "system" };
            // Generate a temporary ID if id is missing
            if (!newNotification.id) {
                console.warn("Notification missing ID, generating temporary ID:", newNotification);
                newNotification.id = `temp-${uuidv4()}`; // Use UUID for temporary ID
            }
            if (newNotification.id) {
                const isDuplicate = (arr) => arr.some((n) => n.id === newNotification.id);
                if (newNotification.type === "job" && !isDuplicate(jobNotifications)) {
                    setJobNotifications((prev) => [
                        ...prev,
                        newNotification,
                    ].sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate)));
                    setMessageCount((prev) => prev + (!newNotification.isRead ? 1 : 0));
                    console.log("Added to jobNotifications:", newNotification);
                } else if (newNotification.type === "update" && !isDuplicate(updateNotifications)) {
                    setUpdateNotifications((prev) => [
                        ...prev,
                        newNotification,
                    ].sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate)));
                    setMessageCount((prev) => prev + (!newNotification.isRead ? 1 : 0));
                    console.log("Added to updateNotifications:", newNotification);
                } else if (newNotification.type === "system" && !isDuplicate(systemNotifications)) {
                    setSystemNotifications((prev) => [
                        ...prev,
                        newNotification,
                    ].sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate)));
                    setMessageCount((prev) => prev + (!newNotification.isRead ? 1 : 0));
                    console.log("Added to systemNotifications:", newNotification);
                } else {
                    console.log("Notification already exists or type mismatch:", newNotification);
                }
            } else {
                console.error("Failed to process notification due to missing ID:", newNotification);
            }
        }, token);

        // Debug state changes
        console.log("Current state - Job:", jobNotifications, "Update:", updateNotifications, "System:", systemNotifications);

        return () => disconnectWebSocket();
    }, [currentPage]);

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        if (showNotifications) {
            setMessageCount(0); // Reset count when closing
        }
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const handleNotificationClick = async (notification) => {
        if (notification.id && !notification.isRead) {
            try {
                let response;
                if (notification.type === "update") {
                    response = await fetch(
                        `http://localhost:8100/api/v1/updateNotification/mark-as-read/${notification.id}`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                        }
                    );
                } else if (notification.type === "job") {
                    response = await fetch(
                        `http://localhost:8100/api/v1/Notification/${notification.id}/mark-as-read`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                        }
                    );
                } else if (notification.type === "system") {
                    // No mark-as-read API for system notifications, update state manually
                    console.log("Skipping mark-as-read for system notification:", notification.id);
                    setSystemNotifications((prev) =>
                        prev.map((notif) =>
                            notif.id === notification.id ? { ...notif, isRead: true } : notif
                        ).sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate))
                    );
                    setMessageCount((prev) => prev - 1);
                    return; // Exit early to avoid the fetch block
                }

                if (response && response.ok) {
                    if (notification.type === "update") {
                        setUpdateNotifications((prev) =>
                            prev
                                .map((notif) =>
                                    notif.id === notification.id ? { ...notif, isRead: true } : notif
                                )
                                .sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate))
                        );
                    } else if (notification.type === "job") {
                        setJobNotifications((prev) =>
                            prev
                                .map((notif) =>
                                    notif.id === notification.id ? { ...notif, isRead: true } : notif
                                )
                                .sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate))
                        );
                    }
                    setMessageCount((prev) => prev - 1);
                } else if (response) {
                    console.error("Failed to mark notification as read:", await response.text());
                }
            } catch (error) {
                console.error("Error marking notification as read:", error);
            }
        }

        if (notification.job) {
            setShowNotifications(false);
            window.location.href = `/job-details?jobId=${notification.job}`;
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const totalPages = Math.ceil(totalNotifications / itemsPerPage);

    const renderPagination = () => (
        <div className="mt-4 flex justify-center gap-2">
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300 hover:bg-blue-600 transition"
            >
                Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-1 ${currentPage === i ? "bg-blue-700" : "bg-blue-500"} text-white rounded hover:bg-blue-600 transition`}
                >
                    {i + 1}
                </button>
            ))}
            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300 hover:bg-blue-600 transition"
            >
                Next
            </button>
        </div>
    );

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <button
                onClick={toggleNotifications}
                className="bg-green-500 text-white p-4 rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition relative"
            >
                <BellIcon className="w-8 h-8" />
                {messageCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                        {messageCount}
                    </span>
                )}
            </button>

            {showNotifications && (
                <div className="absolute bottom-16 right-0 w-96 bg-white rounded-lg shadow-xl p-4 max-h-[80vh] overflow-y-auto border border-gray-200">
                    <div className="flex justify-between mb-4">
                        <button
                            onClick={() => handleTabClick("updates")}
                            className={`px-4 py-2 text-sm font-semibold ${activeTab === "updates" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"} rounded-l-lg`}
                        >
                            Updates
                        </button>
                        <button
                            onClick={() => handleTabClick("system")}
                            className={`px-4 py-2 text-sm font-semibold ${activeTab === "system" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"} rounded-r-lg`}
                        >
                            System
                        </button>
                    </div>

                    <div className="space-y-2">
                        {activeTab === "updates" ? (
                            (jobNotifications.length > 0 || updateNotifications.length > 0 ? (
                                [...jobNotifications, ...updateNotifications]
                                    .sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate))
                                    .map((notif) => (
                                        <div
                                            key={`${notif.type}-${notif.id}`} // Unique key combining type and id
                                            className={`border-b py-2 cursor-pointer hover:bg-gray-100 transition ${notif.isRead ? "bg-gray-50" : "bg-white"}`}
                                            onClick={() => handleNotificationClick(notif)}
                                        >
                                            <p className={`text-sm ${notif.isRead ? "text-gray-500" : "text-gray-800 font-medium"}`}>
                                                {notif.message}
                                            </p>
                                            <small className="text-xs text-gray-400">
                                                {new Date(notif.sentDate).toLocaleString()}
                                            </small>
                                        </div>
                                    ))
                            ) : (
                                <p className="text-gray-500 text-sm">No updates</p>
                            ))
                        ) : (
                            systemNotifications.length === 0 ? (
                                <p className="text-gray-500 text-sm">No system notifications</p>
                            ) : (
                                systemNotifications
                                    .sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate))
                                    .map((notif) => (
                                        <div
                                            key={`${notif.type}-${notif.id}`} // Unique key combining type and id
                                            className={`border-b py-2 cursor-pointer hover:bg-gray-100 transition ${notif.isRead ? "bg-gray-50" : "bg-white"}`}
                                            onClick={() => handleNotificationClick(notif)}
                                        >
                                            <p className={`text-sm ${notif.isRead ? "text-gray-500" : "text-gray-800 font-medium"}`}>
                                                {notif.message}
                                            </p>
                                            <small className="text-xs text-gray-400">
                                                {new Date(notif.sentDate).toLocaleString()}
                                            </small>
                                        </div>
                                    ))
                            )
                        )}
                    </div>

                    {activeTab === "updates" && totalNotifications > itemsPerPage && renderPagination()}
                </div>
            )}
        </div>
    );
};

export default ChatButton;