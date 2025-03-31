import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare, HelpCircle } from "lucide-react";

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
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate API call delay
        setTimeout(() => {
            console.log("Form Submitted:", formData);
            setIsSubmitting(false);
            setSubmitSuccess(true);
            
            // Reset form
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                subject: "General Inquiry",
                message: "",
            });
            
            // Reset success message after 3 seconds
            setTimeout(() => {
                setSubmitSuccess(false);
            }, 3000);
        }, 800);
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

            {/* Features Navigation 
            <div className="w-full max-w-6xl mx-auto mt-8 px-4 sm:px-0">
                <div className="flex gap-2 overflow-x-auto pb-3 snap-x">
                    {[
                        { id: 'general', label: 'General Inquiry', icon: <MessageSquare size={18} />, color: 'bg-blue-500' },
                        { id: 'support', label: 'Support Request', icon: <HelpCircle size={18} />, color: 'bg-purple-500' },
                        { id: 'feedback', label: 'Send Feedback', icon: <Send size={18} />, color: 'bg-green-500' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setFormData({...formData, subject: item.label})}
                            className={`flex-shrink-0 snap-start flex items-center px-4 py-2 rounded-full transition-all duration-300 shadow-sm whitespace-nowrap ${
                                formData.subject === item.label
                                    ? `${item.color} text-white font-semibold shadow-md`
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <span className="mr-2">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>*/}

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
                            
                            {/* <div className="mt-12">
                                <p className="font-medium mb-4">Connect with us</p>
                                <div className="flex space-x-4">
                                    {['facebook', 'twitter', 'instagram', 'linkedin'].map(social => (
                                        <a 
                                            key={social}
                                            href={`#${social}`}
                                            className="bg-blue-400/30 p-2 rounded-full hover:bg-blue-400/60 transition-colors duration-200"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z" />
                                            </svg>
                                        </a>
                                    ))}
                                </div>
                            </div> */}
                        </div>

                        {/* Contact Form */}
                        <div className="p-6 sm:p-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a message</h2>
                            
                            {submitSuccess && (
                                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-md">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-green-800">
                                                Message sent successfully! We'll get back to you soon.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
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
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="subject"
                                                    value={option}
                                                    checked={formData.subject === option}
                                                    onChange={handleChange}
                                                    className="sr-only"
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

            {/* FAQ Section 
            <div className="max-w-6xl mx-auto mt-12 mb-20 px-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Frequently Asked Questions</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {[
                        {
                            q: "How do I create an account?",
                            a: "You can create an account by clicking on the 'Sign Up' button in the top right corner of our homepage. Follow the simple registration process to get started."
                        },
                        {
                            q: "What payment methods do you accept?",
                            a: "We accept major credit/debit cards, PayPal, and bank transfers. All payments are securely processed through our payment gateway."
                        },
                        {
                            q: "How can I reset my password?",
                            a: "Click on the 'Forgot Password' link on the login page. Enter your registered email address, and we'll send you instructions to reset your password."
                        },
                        {
                            q: "How do I apply for a job?",
                            a: "Browse available jobs on our platform, select one that interests you, and click the 'Apply' button. Follow the prompts to complete your application."
                        }
                    ].map((item, i) => (
                        <div key={i} className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.q}</h3>
                            <p className="text-gray-600">{item.a}</p>
                        </div>
                    ))}
                </div>
            </div>*/}
        </div>
    );
};

export default Contact;
