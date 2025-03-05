import React, { useState, useEffect } from "react";
import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/24/solid";
import { connectWebSocket, disconnectWebSocket } from '../../services/notificationService';
import { jwtDecode } from "jwt-decode"; // Import jwt-decode to decode the JWT token
import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing

const ChatButton = () => {
    const [messageCount, setMessageCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const navigate = useNavigate(); // Hook to navigate programmatically

    useEffect(() => {
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("JWT Token not found");
            return;
        }

        // Decode the JWT token to get the username from the "sub" claim
        let username = null;
        try {
            const decodedToken = jwtDecode(token); // Decode the token
            username = decodedToken.sub;  // Extract the username from the "sub" claim
            console.log(`Decoded username: ${username}`);
        } catch (error) {
            console.error("Error decoding JWT token:", error);
            return;
        }

        // Ensure that the username is available
        if (!username) {
            console.error("Username is not available in the token.");
            return;
        }

        // Connect to WebSocket
        connectWebSocket(username, (notification) => {
            setNotifications(prev => [...prev, notification]);
            setMessageCount(prev => prev + 1);
        }, token);

        // Cleanup WebSocket connection on component unmount
        return () => disconnectWebSocket();

    }, []); // Empty dependency array so this runs only once when the component mounts

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        if (showNotifications) {
            setMessageCount(0); // Reset count when viewing
        }
    };

    const handleNotificationClick = async (notification) => {
        try {
            // Mark notification as read
            const response = await fetch(`http://localhost:8100/api/v1/Notification/${notification.id}/mark-as-read`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                // Mark as read successfully, update the notification status
                setNotifications(prevNotifications => 
                    prevNotifications.map(notif => 
                        notif.id === notification.id ? { ...notif, isRead: true } : notif
                    )
                );

                // Navigate to the job details page
                navigate(`/job-details/${notification.job}`);
            } else {
                console.error("Failed to mark notification as read.");
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <button 
                onClick={toggleNotifications}
                className="bg-green-500 text-white p-4 rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition"
            >
                <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8" />
                {messageCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                        {messageCount}
                    </span>
                )}
            </button>

            {showNotifications && (
                <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto border border-gray-200">
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">Notifications</h3>
                    {notifications.length === 0 ? (
                        <p className="text-gray-500">No new notifications</p>
                    ) : (
                        notifications.map((notif) => (
                            <div 
                                key={notif.id} 
                                className={`border-b py-2 cursor-pointer ${notif.isRead ? 'bg-gray-100' : 'hover:bg-gray-50'}`} 
                                onClick={() => handleNotificationClick(notif)} // Handle click to mark as read
                            >
                                <p className={`text-sm ${notif.isRead ? 'text-gray-500' : 'text-gray-800'}`}>{notif.message}</p>
                                <small className="text-xs text-gray-400">
                                    {new Date(notif.sentDate).toLocaleString()}
                                </small>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatButton;
