import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import SubmitNotiBox from "../../../Components/SubmitNotiBox/SubmitNotiBox";

const ANotification = () => {
    const [message, setMessage] = useState("");
    const [recipientType, setRecipientType] = useState("broadcast");
    const [userId, setUserId] = useState("");
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState(""); // For internal state tracking
    const [showNotification, setShowNotification] = useState(false);
    const [notificationStatus, setNotificationStatus] = useState("success");
    const [notificationMessage, setNotificationMessage] = useState("");
    const notificationCenterRef = useRef(null);
    
    // Get the query parameters from the URL
    const location = useLocation();
    
    useEffect(() => {
        // Scroll to the notification center when component mounts
        if (notificationCenterRef.current) {
            notificationCenterRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Parse the query string to get userId parameter
        const queryParams = new URLSearchParams(location.search);
        const userIdParam = queryParams.get("userId");
        
        // If userId parameter exists, set recipientType to "specific" and populate userId
        if (userIdParam) {
            setRecipientType("specific");
            setUserId(userIdParam);
        }
    }, [location.search]);

    const handleSendNotification = async () => {
        if (!message.trim()) {
            setStatusMessage("Please enter a notification message");
            showNotificationBox("Please enter a notification message", "error");
            return;
        }

        if (recipientType === "specific" && !userId.trim()) {
            setStatusMessage("Please enter a user ID");
            showNotificationBox("Please enter a user ID", "error");
            return;
        }

        setLoading(true);
        setStatusMessage("");
        
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setStatusMessage("Authentication error: Please log in again");
                showNotificationBox("Authentication error: Please log in again", "error");
                return;
            }
            
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
                },
                timeout: 10000 // 10 second timeout
            });
            
            if (response.data.code === 200) {
                const successMsg = response.data.message || "Notification sent successfully";
                setStatusMessage(successMsg);
                showNotificationBox(successMsg, "success");
                setMessage("");
                if (recipientType === "specific") {
                    setUserId("");
                }
            } else {
                const errorMsg = `Error (${response.data.code}): ${response.data.message || "Failed to send notification"}`;
                setStatusMessage(errorMsg);
                showNotificationBox(errorMsg, "error");
            }
        } catch (error) {
            console.error("Error sending notification:", error);
            
            let errorMsg = "";
            
            if (error.code === "ECONNABORTED") {
                errorMsg = "Request timed out. Server may be unavailable.";
            } else if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                const status = error.response.status;
                const errorMessage = error.response.data?.message || "Unknown error occurred";
                
                if (status === 401) {
                    errorMsg = "Authentication error: Your session may have expired";
                } else if (status === 403) {
                    errorMsg = "Permission denied: You don't have rights to send this notification";
                } else if (status === 404) {
                    if (recipientType === "specific") {
                        errorMsg = `User with ID "${userId}" not found`;
                    } else {
                        errorMsg = "The requested endpoint was not found";
                    }
                } else if (status === 400) {
                    errorMsg = `Bad request: ${errorMessage}`;
                } else if (status >= 500) {
                    errorMsg = `Server error (${status}): Please try again later`;
                } else {
                    errorMsg = `Error (${status}): ${errorMessage}`;
                }
            } else if (error.request) {
                // The request was made but no response was received
                errorMsg = "No response from server. Please check your connection.";
            } else {
                // Something happened in setting up the request that triggered an Error
                errorMsg = `Error: ${error.message || "Failed to send notification"}`;
            }
            
            setStatusMessage(errorMsg);
            showNotificationBox(errorMsg, "error");
        } finally {
            setLoading(false);
        }
    };

    // Helper function to display notifications using SubmitNotiBox
    const showNotificationBox = (message, status) => {
        setNotificationMessage(message);
        setNotificationStatus(status);
        setShowNotification(true);
        
        // Hide the notification after a few seconds
        setTimeout(() => {
            setShowNotification(false);
        }, 5000); // Adjust this time as needed
    };

    return (
        <div>
            {/* Add SubmitNotiBox component */}
            {showNotification && (
                <SubmitNotiBox 
                    message={notificationMessage} 
                    status={notificationStatus} 
                    duration={5000}
                />
            )}
            
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

            {/* Notification Form - Updated UI */}
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8" ref={notificationCenterRef}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Notification Center</h2>
                    </div>

                    {/* You can keep this for debugging or remove it since we're using SubmitNotiBox now */}
                    {/* {statusMessage && (
                        <div className={`mb-6 p-4 rounded-lg flex items-center ${
                            statusMessage.includes("Error") || 
                            statusMessage.includes("Failed") || 
                            statusMessage.includes("error") || 
                            statusMessage.includes("denied") || 
                            statusMessage.includes("expired") || 
                            statusMessage.includes("not found") || 
                            statusMessage.includes("Please") || 
                            statusMessage.includes("timed out") || 
                            statusMessage.includes("unavailable")
                                ? "bg-red-50 text-red-700 border border-red-200" 
                                : "bg-green-50 text-green-700 border border-green-200"
                        }`}>
                            <span className="mr-2">
                                {statusMessage.includes("Error") || 
                                statusMessage.includes("Failed") || 
                                statusMessage.includes("error") || 
                                statusMessage.includes("denied") || 
                                statusMessage.includes("expired") || 
                                statusMessage.includes("not found") || 
                                statusMessage.includes("Please") || 
                                statusMessage.includes("timed out") || 
                                statusMessage.includes("unavailable") ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </span>
                            {statusMessage}
                        </div>
                    )} */}
                    
                    {/* Recipient Selection - Enhanced cards with icons */}
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-700 mb-3">Select Recipients</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div 
                                onClick={() => setRecipientType("broadcast")}
                                className={`p-4 border rounded-lg flex flex-col items-center cursor-pointer transition-all ${
                                    recipientType === "broadcast"
                                        ? "bg-blue-50 border-blue-300 shadow-sm text-blue-700"
                                        : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                                <span className="font-medium">All Users</span>
                            </div>
                            
                            <div 
                                onClick={() => setRecipientType("employers")}
                                className={`p-4 border rounded-lg flex flex-col items-center cursor-pointer transition-all ${
                                    recipientType === "employers"
                                        ? "bg-blue-50 border-blue-300 shadow-sm text-blue-700"
                                        : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="font-medium">All Employers</span>
                            </div>
                            
                            <div 
                                onClick={() => setRecipientType("students")}
                                className={`p-4 border rounded-lg flex flex-col items-center cursor-pointer transition-all ${
                                    recipientType === "students"
                                        ? "bg-blue-50 border-blue-300 shadow-sm text-blue-700"
                                        : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                                </svg>
                                <span className="font-medium">All Students</span>
                            </div>
                            
                            <div 
                                onClick={() => setRecipientType("specific")}
                                className={`p-4 border rounded-lg flex flex-col items-center cursor-pointer transition-all ${
                                    recipientType === "specific"
                                        ? "bg-blue-50 border-blue-300 shadow-sm text-blue-700"
                                        : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="font-medium">Specific User</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* User ID input (only if specific user is selected) - Enhanced styling */}
                    {recipientType === "specific" && (
                        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                                User ID
                            </label>
                            <div className="flex">
                                <div className="flex-grow">
                                    <input
                                        type="text"
                                        id="userId"
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                        placeholder="Enter user ID"
                                    />
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">Enter the unique identifier of the user to send a direct notification.</p>
                        </div>
                    )}
                    
                    {/* Message input - Enhanced styling */}
                    <div className="mb-6">
                        <label htmlFor="message" className="block text-lg font-medium text-gray-700 mb-2">
                            Notification Message
                        </label>
                        <textarea
                            id="message"
                            rows={6}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            placeholder="Enter your notification message here..."
                        />
                        <p className="mt-2 text-sm text-gray-500">
                            {200 - message.length} characters remaining
                        </p>
                    </div>
                    
                    {/* Submit button - Enhanced styling */}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleSendNotification}
                            disabled={loading}
                            className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${
                                loading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sending...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    Send Notification
                                </span>
                            )}
                        </button>
                    </div>
                </div>
                
                {/* Help Section - Enhanced with more info and better styling */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        About Notifications
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Recipient Types</h4>
                            <ul className="text-sm text-gray-600 space-y-3 ml-1">
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span><strong>All Users:</strong> Send a notification to every user on the platform</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span><strong>All Employers:</strong> Send a notification only to employer accounts</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span><strong>All Students:</strong> Send a notification only to student accounts</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span><strong>Specific User:</strong> Send a notification to a single user with the given ID</span>
                                </li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Best Practices</h4>
                            <ul className="text-sm text-gray-600 space-y-3 ml-1">
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span>Keep notifications concise and informative</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span>Use broadcast notifications sparingly to avoid notification fatigue</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span>Include a clear call-to-action when needed</span>
                                </li>
                            </ul>
                            <p className="mt-4 text-sm text-gray-500 italic">
                                Notifications are delivered in real-time and will appear in the user's notification center.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ANotification;