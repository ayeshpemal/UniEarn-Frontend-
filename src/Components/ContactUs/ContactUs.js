import React, { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "General Inquiry",
        message: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form Submitted:", formData);
        alert("Your message has been sent!");
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            subject: "General Inquiry",
            message: "",
        });
    };

    return (
        <div className="min-h-screen bg-white">
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
                            Get in touch with our team
                        </p>
                    </div>
                </div>
            </div>

            {/* Contact Form Section (Directly Below Hero Section) */}
            <div className="max-w-6xl mx-auto mt-[50px] p-8 bg-white shadow-lg rounded-lg">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Get In Touch</h2>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Contact Info Section */}
                    <div className="bg-blue-500 text-white rounded-lg p-6">
                        <h3 className="text-2xl font-semibold">Contact Information</h3>
                        <p className="mt-2">Feel free to reach out to us!</p>

                        <div className="mt-4 space-y-4">
                            <div className="flex items-center space-x-4">
                                <Phone size={20} />
                                <span>+94 77 123 4567</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Mail size={20} />
                                <span>demo@gmail.com</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <MapPin size={20} />
                                <span>123 , Matara</span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Subject Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Select Subject</label>
                            <div className="flex items-center space-x-4 mt-2">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="subject"
                                        value="General Inquiry"
                                        checked={formData.subject === "General Inquiry"}
                                        onChange={handleChange}
                                    />
                                    <span>General Inquiry</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="subject"
                                        value="Support Request"
                                        checked={formData.subject === "Support Request"}
                                        onChange={handleChange}
                                    />
                                    <span>Support Request</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="subject"
                                        value="Feedback"
                                        checked={formData.subject === "Feedback"}
                                        onChange={handleChange}
                                    />
                                    <span>Feedback</span>
                                </label>
                            </div>
                        </div>

                        {/* Message Box */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Message</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows={4}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="text-center">
                            <button
                                type="submit"
                                className="bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition"
                            >
                                Send Message
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
