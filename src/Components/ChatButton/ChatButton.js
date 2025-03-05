import React, { useState, useEffect } from "react";
import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/24/solid";
import { connectWebSocket, disconnectWebSocket } from '../../services/notificationService';

const ChatButton = ({ username }) => { // Assume username is passed as prop
    const [messageCount, setMessageCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('jwtToken'); // Adjust based on where you store it
        connectWebSocket(username, (notification) => {
            setNotifications(prev => [...prev, notification]);
            setMessageCount(prev => prev + 1);
        }, token);
        return () => disconnectWebSocket();
    }, [username]);

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        if (showNotifications) {
            setMessageCount(0); // Reset count when viewing
        }
    };

    return (
        <div className="fixed bottom-6 right-6">
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
                <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto">
                    <h3 className="text-lg font-bold mb-2">Notifications</h3>
                    {notifications.length === 0 ? (
                        <p>No new notifications</p>
                    ) : (
                        notifications.map((notif, index) => (
                            <div key={index} className="border-b py-2">
                                <p>{notif.message}</p>
                                <small className="text-gray-500">
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