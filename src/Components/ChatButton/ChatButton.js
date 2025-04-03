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
    const [totalUpdateNotifications, setTotalUpdateNotifications] = useState(0);
    const [totalJobNotifications, setTotalJobNotifications] = useState(0);
    const [currentUpdatePage, setCurrentUpdatePage] = useState(0);
    const [currentJobPage, setCurrentJobPage] = useState(0);

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
                    `http://localhost:8100/api/v1/updateNotification/get-update-notifications/${userId}?page=${currentUpdatePage}&size=${itemsPerPage}`,
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
                    setTotalUpdateNotifications(updateData.data.totalNotifications || 0);
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
                        `http://localhost:8100/api/v1/Notification/get-job-notifications/${userId}?page=${currentJobPage}&size=${itemsPerPage}`,
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
                        setTotalJobNotifications(jobData.data.totalNotifications || 0);
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
    }, [currentUpdatePage, currentJobPage]);

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
                    //return; // Exit early to avoid the fetch block
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
            
            // Get role from JWT token
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    const role = decodedToken.role || "";
                    
                    // Redirect based on user role
                    if (role === "EMPLOYER") {
                        window.location.href = `/e-job-details?jobId=${notification.job}`;
                    } else {
                        // Default path for STUDENT or any other role
                        window.location.href = `/job-details?jobId=${notification.job}`;
                    }
                } catch (error) {
                    console.error("Error decoding token for redirection:", error);
                    // Fallback to default path if token decoding fails
                    window.location.href = `/job-details?jobId=${notification.job}`;
                }
            } else {
                // Fallback if no token exists
                window.location.href = `/job-details?jobId=${notification.job}`;
            }
        }

        if(notification.type === "system"){
            
            // Get role from JWT token
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    const role = decodedToken.role || "";
                    
                    // Redirect based on user role
                    if (role === "ADMIN"){
                        window.location.href = `/a-report?userId=1`;
                        setShowNotifications(false);
                    }
                } catch (error) {
                    console.error("Error decoding token for redirection:", error);
                }
            }
        }
    };

    const handlePageChange = (page, type) => {
        if (type === "update") {
            setCurrentUpdatePage(page);
        } else if (type === "job") {
            setCurrentJobPage(page);
        }
    };

    const renderPagination = (type) => {
        const currentPage = type === "update" ? currentUpdatePage : currentJobPage;
        const totalItems = type === "update" ? totalUpdateNotifications : totalJobNotifications;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        if (totalPages <= 1) return null; // Don't show pagination if only one page
        
        return (
            <div className="mt-3 sm:mt-4 flex justify-center gap-1 sm:gap-2">
                <button
                    onClick={() => handlePageChange(currentPage - 1, type)}
                    disabled={currentPage === 0}
                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-500 text-white rounded-md disabled:bg-gray-300 hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                    Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                    const pageNum = i + Math.max(0, currentPage - 1);
                    if (pageNum < totalPages) {
                        return (
                            <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum, type)}
                                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm ${
                                    currentPage === pageNum 
                                        ? "bg-blue-700 shadow-inner" 
                                        : "bg-blue-500"
                                } text-white rounded-md hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300`}
                            >
                                {pageNum + 1}
                            </button>
                        );
                    }
                    return null;
                })}
                <button
                    onClick={() => handlePageChange(currentPage + 1, type)}
                    disabled={currentPage === totalPages - 1}
                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-500 text-white rounded-md disabled:bg-gray-300 hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                    Next
                </button>
            </div>
        );
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <button
                onClick={toggleNotifications}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-full shadow-xl flex items-center justify-center hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 relative"
            >
                <BellIcon className="w-6 h-6 md:w-8 md:h-8" />
                {messageCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center shadow-md animate-pulse">
                        {messageCount}
                    </span>
                )}
            </button>

            {showNotifications && (
                <div className="absolute bottom-16 right-0 w-[90vw] max-w-[360px] sm:w-96 bg-white rounded-xl shadow-2xl p-3 sm:p-4 max-h-[80vh] overflow-y-auto border border-gray-200 transition-all duration-300 ease-in-out backdrop-filter backdrop-blur-sm bg-opacity-95">
                    <div className="flex justify-between mb-3 bg-gray-50 rounded-lg p-1">
                        <button
                            onClick={() => handleTabClick("updates")}
                            className={`px-3 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                                activeTab === "updates"
                                    ? "bg-blue-500 text-white shadow-md"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            } rounded-lg w-1/2`}
                        >
                            Updates
                        </button>
                        <button
                            onClick={() => handleTabClick("system")}
                            className={`px-3 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                                activeTab === "system"
                                    ? "bg-blue-500 text-white shadow-md"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            } rounded-lg w-1/2`}
                        >
                            System
                        </button>
                    </div>

                    <div className="space-y-2 divide-y divide-gray-100">
                        {activeTab === "updates" ? (
                            (jobNotifications.length > 0 || updateNotifications.length > 0 ? (
                                [...jobNotifications, ...updateNotifications]
                                    //.filter(notif => notif.type === "job" || notif.type === "update") // Add explicit filter
                                    .sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate))
                                    .map((notif) => (
                                        <div
                                            key={`${notif.type}-${notif.id}`}
                                            className={`py-2 sm:py-3 px-2 cursor-pointer rounded-lg transition-all duration-200 ${
                                                notif.isRead 
                                                    ? "bg-gray-50 hover:bg-gray-100" 
                                                    : "bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500"
                                            }`}
                                            onClick={() => handleNotificationClick(notif)}
                                        >
                                            <p className={`text-xs sm:text-sm mb-1 ${
                                                notif.isRead ? "text-gray-500" : "text-gray-800 font-medium"
                                            }`}>
                                                {notif.message}
                                            </p>
                                            <div className="flex items-center">
                                                <small className="text-[10px] sm:text-xs text-gray-400">
                                                    {new Date(notif.sentDate).toLocaleString()}
                                                </small>
                                                {!notif.isRead && (
                                                    <span className="ml-auto h-2 w-2 bg-blue-500 rounded-full"></span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
                                    <p className="text-gray-500 text-xs sm:text-sm mb-2">No updates available</p>
                                    <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                                    </svg>
                                </div>
                            ))
                        ) : (
                            systemNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
                                    <p className="text-gray-500 text-xs sm:text-sm mb-2">No system notifications</p>
                                    <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                            ) : (
                                systemNotifications
                                    //.filter((notif) => notif.type === "system")
                                    .sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate))
                                    .map((notif) => (
                                        <div
                                            key={`${notif.type}-${notif.id}`}
                                            className={`py-2 sm:py-3 px-2 cursor-pointer rounded-lg transition-all duration-200 ${
                                                notif.isRead 
                                                    ? "bg-gray-50 hover:bg-gray-100" 
                                                    : "bg-yellow-50 hover:bg-yellow-100 border-l-4 border-yellow-500"
                                            }`}
                                            onClick={() => handleNotificationClick(notif)}
                                        >
                                            <p className={`text-xs sm:text-sm mb-1 ${
                                                notif.isRead ? "text-gray-500" : "text-gray-800 font-medium"
                                            }`}>
                                                {notif.message}
                                            </p>
                                            <div className="flex items-center">
                                                <small className="text-[10px] sm:text-xs text-gray-400">
                                                    {new Date(notif.sentDate).toLocaleString()}
                                                </small>
                                                {!notif.isRead && (
                                                    <span className="ml-auto h-2 w-2 bg-yellow-500 rounded-full"></span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                            )
                        )}
                    </div>

                    {activeTab === "updates" && renderPagination("update")}
                </div>
            )}
        </div>
    );
};

export default ChatButton;