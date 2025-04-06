import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare, HelpCircle } from "lucide-react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import SubmitNotiBox from "../SubmitNotiBox/SubmitNotiBox";

const Contact = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "General Inquiry",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Replace success and error states with notification state
    const [notification, setNotification] = useState({
        message: "",
        status: "",
        visible: false
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Function to show notifications
    const showNotification = (message, status) => {
        // Reset first if there's a notification already visible
        if (notification.visible) {
            setNotification({
                message: "",
                status: "",
                visible: false
            });
            
            // Small delay to ensure state update before showing new notification
            setTimeout(() => {
                setNotification({
                    message,
                    status,
                    visible: true
                });
            }, 100);
        } else {
            // Otherwise just show the notification
            setNotification({
                message,
                status,
                visible: true
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try { 
            // Get base URL from config.js
            const baseUrl = window._env_?.BASE_URL || "http://localhost:8100";
            console.log("API Base URL:", baseUrl);
            
            // Send email through API using the configured base URL
            const response = await axios.post(
                `${baseUrl}/api/email/send`,
                {
                    ...formData,
                    fullName: `${formData.firstName} ${formData.lastName}`
                }
            );
            
            console.log("Email sent successfully:", response.data);
            
            // Show success notification using SubmitNotiBox
            showNotification("Message sent successfully! We'll get back to you soon.", "success");
            
            // Reset form
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                subject: "General Inquiry",
                message: "",
            });
            
        } catch (error) {
            console.error("Error sending email:", error);
            
            // Show error notification using SubmitNotiBox
            showNotification(
                error.response?.data?.message || 
                error.message || 
                "Failed to send message. Please try again.",
                "error"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            {/* Hero Section */}
            <div
                className="relative h-[60vh] bg-cover bg-center"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80")',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/40 backdrop-blur-[1px]">
                    <div className="max-w-7xl mx-auto h-full flex flex-col justify-end pb-24 px-4 sm:px-6">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-md mt-20">
                            Contact<br />
                            <span className="text-blue-400 drop-shadow-lg">Us</span>
                        </h1>
                        <p className="mt-3 text-white/90 text-lg sm:text-xl max-w-2xl drop-shadow-sm">
                            Get in touch with our team - we're here to help
                        </p>
                    </div>
                </div>
            </div>

            {/* Contact Form Section */}
            <div className="max-w-6xl mx-auto mt-6 p-6 sm:p-8 relative z-10">
                <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-0">
                        {/* Contact Info Section */}
                        <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 sm:p-8">
                            <h3 className="text-2xl font-bold mb-4">Contact Information</h3>
                            <p className="mb-8 opacity-90">Feel free to reach out to us - we're always here to help with your questions and concerns.</p>

                            <div className="space-y-6 mt-8">
                                <div className="flex items-start space-x-4">
                                    <div className="bg-blue-400/30 p-3 rounded-full">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium">Phone</p>
                                        <p className="opacity-90">+94 77 123 4567</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start space-x-4">
                                    <div className="bg-blue-400/30 p-3 rounded-full">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium">Email</p>
                                        <p className="opacity-90">support@uniearn.edu</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start space-x-4">
                                    <div className="bg-blue-400/30 p-3 rounded-full">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium">Address</p>
                                        <p className="opacity-90">123 University Avenue, Matara, Sri Lanka</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="p-6 sm:p-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a message</h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                            placeholder="Enter your first name"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                            placeholder="Enter your last name"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        placeholder="example@email.com"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        placeholder="+94 77 000 0000"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Subject Selection - Improved */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
                                    <div className="flex flex-wrap gap-2">
                                        {["General Inquiry", "Support Request", "Feedback"].map((option) => (
                                            <label 
                                                key={option}
                                                className={`flex items-center px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                                    formData.subject === option 
                                                    ? "bg-blue-100 border border-blue-500 text-blue-700"
                                                    : "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100"
                                                } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="subject"
                                                    value={option}
                                                    checked={formData.subject === option}
                                                    onChange={handleChange}
                                                    className="sr-only"
                                                    disabled={isSubmitting}
                                                />
                                                <span className={`${formData.subject === option ? "font-medium" : ""}`}>
                                                    {option}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Message Box */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={4}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        placeholder="How can we help you?"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Submit Button */}
                                <div className="mt-6">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex justify-center items-center disabled:opacity-70"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                Send Message
                                                <Send size={18} className="ml-2" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* SubmitNotiBox for notifications */}
            {notification.visible && (
                <SubmitNotiBox 
                    message={notification.message} 
                    status={notification.status} 
                    duration={4000}
                />
            )}
        </div>
    );
};

export default Contact;
