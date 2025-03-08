import React, { useState, useEffect } from "react";
import { BellIcon } from "@heroicons/react/24/solid";
import { connectWebSocket, disconnectWebSocket } from '../../services/notificationService';
import { jwtDecode } from "jwt-decode";

const ChatButton = () => {
    const [messageCount, setMessageCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [activeTab, setActiveTab] = useState("updates");
    const [jobNotifications, setJobNotifications] = useState([]);
    const [systemNotifications, setSystemNotifications] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalNotifications, setTotalNotifications] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("JWT Token not found");
            return;
        }

        let username = null;
        let userId = null;
        try {
            const decodedToken = jwtDecode(token);
            username = decodedToken.sub;
            userId = decodedToken.user_id || decodedToken.sub;
            console.log(`Decoded username: ${username}`);
        } catch (error) {
            console.error("Error decoding JWT token:", error);
            return;
        }

        if (!username) {
            console.error("Username is not available in the token.");
            return;
        }

        // Fetch initial notifications
        const fetchNotifications = async () => {
            try {
                const response = await fetch(
                    `http://localhost:8100/api/v1/Notification/get-notifications/${userId}?page=${currentPage}&size=${itemsPerPage}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                const data = await response.json();
                if (data.code === 200) {
                    const sortedNotifications = data.data.notifications.sort(
                        (a, b) => new Date(b.sentDate) - new Date(a.sentDate)
                    );
                    setJobNotifications(sortedNotifications);
                    setTotalNotifications(data.data.totalNotifications);
                    setMessageCount(sortedNotifications.filter(notif => !notif.isRead).length);
                }
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchNotifications();

        // Set up WebSocket
        connectWebSocket(username, (notification, type) => {
            if (type === 'job') {
                setJobNotifications(prev => {
                    const updated = [...prev, notification];
                    return updated.sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate));
                });
            } else if (type === 'system') {
                setSystemNotifications(prev => {
                    const updated = [...prev, notification];
                    return updated.sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate));
                });
            }
            setMessageCount(prev => prev + 1);
        }, token);

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
        if (notification.id) {
            if (!notification.isRead) {
                try {
                    const response = await fetch(`http://localhost:8100/api/v1/Notification/${notification.id}/mark-as-read`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    if (response.ok) {
                        setJobNotifications(prev =>
                            prev.map(notif =>
                                notif.id === notification.id ? { ...notif, isRead: true } : notif
                            ).sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate))
                        );
                        setSystemNotifications(prev =>
                            prev.map(notif =>
                                notif.id === notification.id ? { ...notif, isRead: true } : notif
                            ).sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate))
                        );
                        setMessageCount(prev => prev - 1); // Decrease count when marked as read
                    } else {
                        console.error("Failed to mark notification as read.");
                    }
                } catch (error) {
                    console.error("Error marking notification as read:", error);
                }
            }
            
            if (notification.job) {
                setShowNotifications(false); // Close panel before navigation
                // Force full page reload
                window.location.href = `/job-details?jobId=${notification.job}`;
            }
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
                    className={`px-3 py-1 ${currentPage === i ? 'bg-blue-700' : 'bg-blue-500'} text-white rounded hover:bg-blue-600 transition`}
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
                            jobNotifications.length === 0 ? (
                                <p className="text-gray-500 text-sm">No job updates</p>
                            ) : (
                                jobNotifications.map((notif) => (
                                    <div 
                                        key={notif.id} 
                                        className={`border-b py-2 cursor-pointer hover:bg-gray-100 transition ${notif.isRead ? 'bg-gray-50' : 'bg-white'}`}
                                        onClick={() => handleNotificationClick(notif)}
                                    >
                                        <p className={`text-sm ${notif.isRead ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
                                            {notif.message}
                                        </p>
                                        <small className="text-xs text-gray-400">
                                            {new Date(notif.sentDate).toLocaleString()}
                                        </small>
                                    </div>
                                ))
                            )
                        ) : (
                            systemNotifications.length === 0 ? (
                                <p className="text-gray-500 text-sm">No system notifications</p>
                            ) : (
                                systemNotifications.map((notif) => (
                                    <div 
                                        key={notif.id} 
                                        className={`border-b py-2 cursor-pointer hover:bg-gray-100 transition ${notif.isRead ? 'bg-gray-50' : 'bg-white'}`}
                                        onClick={() => handleNotificationClick(notif)}
                                    >
                                        <p className={`text-sm ${notif.isRead ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
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