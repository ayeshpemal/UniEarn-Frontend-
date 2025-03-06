import React, { useState, useEffect } from "react";
import { BellIcon } from "@heroicons/react/24/solid";
import { connectWebSocket, disconnectWebSocket } from '../../services/notificationService';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

const ChatButton = () => {
    const [messageCount, setMessageCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [activeTab, setActiveTab] = useState("updates");
    const [jobNotifications, setJobNotifications] = useState([]);
    const [systemNotifications, setSystemNotifications] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("JWT Token not found");
            return;
        }

        let username = null;
        try {
            const decodedToken = jwtDecode(token);
            username = decodedToken.sub;
            console.log(`Decoded username: ${username}`);
        } catch (error) {
            console.error("Error decoding JWT token:", error);
            return;
        }

        if (!username) {
            console.error("Username is not available in the token.");
            return;
        }

        connectWebSocket(username, (notification, type) => {
            if (type === 'job') {
                setJobNotifications(prev => [...prev, notification]);
            } else if (type === 'system') {
                setSystemNotifications(prev => [...prev, notification]);
            }
            setMessageCount(prev => prev + 1);
        }, token);

        return () => disconnectWebSocket();
    }, []);

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        if (showNotifications) {
            setMessageCount(0);
        }
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const handleNotificationClick = async (notification) => {
        if (notification.id) {
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
                        )
                    );
                    setSystemNotifications(prev =>
                        prev.map(notif =>
                            notif.id === notification.id ? { ...notif, isRead: true } : notif
                        )
                    );
                    if (notification.job) {
                        navigate(`/job-details/${notification.job}`);
                    }
                } else {
                    console.error("Failed to mark notification as read.");
                }
            } catch (error) {
                console.error("Error marking notification as read:", error);
            }
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <button 
                onClick={toggleNotifications}
                className="bg-green-500 text-white p-4 rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition"
            >
                <BellIcon className="w-8 h-8" />
                {messageCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                        {messageCount}
                    </span>
                )}
            </button>

            {showNotifications && (
                <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto border border-gray-200">
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
                                <p>No job updates</p>
                            ) : (
                                jobNotifications.map((notif, index) => (
                                    <div key={index} className="border-b py-2 cursor-pointer hover:bg-gray-100" onClick={() => handleNotificationClick(notif)}>
                                        <p className={`text-sm ${notif.isRead ? 'text-gray-500' : 'text-gray-800'}`}>{notif.message}</p>
                                        <small className="text-xs text-gray-400">{new Date(notif.sentDate).toLocaleString()}</small>
                                    </div>
                                ))
                            )
                        ) : (
                            systemNotifications.length === 0 ? (
                                <p>No system notifications</p>
                            ) : (
                                systemNotifications.map((notif, index) => (
                                    <div key={index} className="border-b py-2 cursor-pointer hover:bg-gray-100" onClick={() => handleNotificationClick(notif)}>
                                        <p className={`text-sm ${notif.isRead ? 'text-gray-500' : 'text-gray-800'}`}>{notif.message}</p>
                                        <small className="text-xs text-gray-400">{new Date(notif.sentDate).toLocaleString()}</small>
                                    </div>
                                ))
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatButton;