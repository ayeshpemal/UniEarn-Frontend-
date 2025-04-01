import React, { useState } from "react";
import axios from "axios";

const ANotification = () => {
    const [message, setMessage] = useState("");
    const [recipientType, setRecipientType] = useState("broadcast");
    const [userId, setUserId] = useState("");
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState(""); // For showing status messages

    const handleSendNotification = async () => {
        if (!message.trim()) {
            setStatusMessage("Please enter a notification message");
            return;
        }

        if (recipientType === "specific" && !userId.trim()) {
            setStatusMessage("Please enter a user ID");
            return;
        }

        setLoading(true);
        setStatusMessage("");
        
        try {
            const token = localStorage.getItem("token");
            let endpoint = "";
            
            switch (recipientType) {
                case "broadcast":
                    endpoint = "http://localhost:8100/api/admin/notification/broadcast";
                    break;
                case "employers":
                    endpoint = "http://localhost:8100/api/admin/notification/send-to-all-employers";
                    break;
                case "students":
                    endpoint = "http://localhost:8100/api/admin/notification/send-to-all-students";
                    break;
                case "specific":
                    endpoint = `http://localhost:8100/api/admin/notification/send-to-user/${userId}`;
                    break;
                default:
                    endpoint = "http://localhost:8100/api/admin/notification/broadcast";
            }
            
            const response = await axios.post(endpoint, message, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.code === 200) {
                setStatusMessage(response.data.message || "Notification sent successfully");
                setMessage("");
                if (recipientType === "specific") {
                    setUserId("");
                }
            } else {
                setStatusMessage("Failed to send notification");
            }
        } catch (error) {
            console.error("Error sending notification:", error);
            setStatusMessage(error.response?.data?.message || "Failed to send notification");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Hero Section - Matching Admins component styling */}
            <div
                className="relative h-[60vh] bg-cover bg-center"
                style={{
                    backgroundImage:
                        'url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80")',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/40 backdrop-blur-[1px]">
                    <div className="max-w-7xl mx-auto h-full flex flex-col justify-end pb-24 px-4 sm:px-6">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-md mt-20">
                            Notifications<br />
                            <span className="text-blue-400 drop-shadow-lg">Management</span>
                        </h1>
                        <p className="mt-3 text-white/90 text-lg sm:text-xl max-w-2xl drop-shadow-sm">
                            Send targeted or broadcast notifications to platform users
                        </p>
                    </div>
                </div>
            </div>

            {/* Notification Form */}
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
                {/* Status message display */}
                {statusMessage && (
                    <div className={`mb-4 p-4 rounded-md ${statusMessage.includes("Failed") || statusMessage.includes("Please") ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
                        {statusMessage}
                    </div>
                )}
                
                <div className="bg-white shadow-xl rounded-lg p-8 border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Notification</h2>
                    
                    {/* Recipient Type Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Recipient
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <button
                                type="button"
                                onClick={() => setRecipientType("broadcast")}
                                className={`py-3 px-4 border rounded-md text-sm font-medium transition-colors ${
                                    recipientType === "broadcast"
                                        ? "bg-blue-100 text-blue-700 border-blue-300"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                All Users
                            </button>
                            <button
                                type="button"
                                onClick={() => setRecipientType("employers")}
                                className={`py-3 px-4 border rounded-md text-sm font-medium transition-colors ${
                                    recipientType === "employers"
                                        ? "bg-blue-100 text-blue-700 border-blue-300"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                All Employers
                            </button>
                            <button
                                type="button"
                                onClick={() => setRecipientType("students")}
                                className={`py-3 px-4 border rounded-md text-sm font-medium transition-colors ${
                                    recipientType === "students"
                                        ? "bg-blue-100 text-blue-700 border-blue-300"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                All Students
                            </button>
                            <button
                                type="button"
                                onClick={() => setRecipientType("specific")}
                                className={`py-3 px-4 border rounded-md text-sm font-medium transition-colors ${
                                    recipientType === "specific"
                                        ? "bg-blue-100 text-blue-700 border-blue-300"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                Specific User
                            </button>
                        </div>
                    </div>
                    
                    {/* User ID input (only if specific user is selected) */}
                    {recipientType === "specific" && (
                        <div className="mb-6">
                            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                                User ID
                            </label>
                            <input
                                type="text"
                                id="userId"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter user ID"
                            />
                        </div>
                    )}
                    
                    {/* Message input */}
                    <div className="mb-6">
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                            Notification Message
                        </label>
                        <textarea
                            id="message"
                            rows={6}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your notification message here..."
                        />
                    </div>
                    
                    {/* Submit button */}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleSendNotification}
                            disabled={loading}
                            className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                loading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                        >
                            {loading ? "Sending..." : "Send Notification"}
                        </button>
                    </div>
                </div>
                
                {/* Help Section */}
                <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">About Notifications</h3>
                    <ul className="text-sm text-gray-600 space-y-2 ml-4 list-disc">
                        <li><strong>All Users:</strong> Send a notification to every user on the platform</li>
                        <li><strong>All Employers:</strong> Send a notification only to employer accounts</li>
                        <li><strong>All Students:</strong> Send a notification only to student accounts</li>
                        <li><strong>Specific User:</strong> Send a notification to a single user with the given ID</li>
                    </ul>
                    <p className="mt-4 text-sm text-gray-500">
                        Notifications are delivered in real-time and will appear in the user's notification center.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ANotification;