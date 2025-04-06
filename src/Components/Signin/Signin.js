import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, X, Mail, Loader2 } from "lucide-react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import SubmitNotiBox from "../SubmitNotiBox/SubmitNotiBox";

const Signin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        userName: "",
        password: "",
    });
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isResendSuccess, setIsResendSuccess] = useState(false);
    const [showForgotPasswordPopup, setShowForgotPasswordPopup] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
    const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
    const [isForgotPasswordSuccess, setIsForgotPasswordSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Add notification state
    const [notification, setNotification] = useState({
        message: "",
        status: "",
        visible: false
    });

    // Reset notification after duration
    useEffect(() => {
        let timer;
        if (notification.visible) {
            timer = setTimeout(() => {
                setNotification(prev => ({ ...prev, visible: false }));
            }, 4000); // Match duration in SubmitNotiBox
        }
        return () => clearTimeout(timer);
    }, [notification.visible]);

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

    const verification = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const response = await axios.post(
                "http://localhost:8100/api/user/login",
                formData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            const token = response.data.data;
            localStorage.setItem("token", token);

            if (response.status === 200) {
                const decoded = jwtDecode(token);
                console.log("Decoded token:", decoded);
                const role = decoded.role;

                // Show success notification using helper function
                showNotification("Login Successful!", "success");

                // Delay navigation to allow notification to be seen
                setTimeout(() => {
                    setIsLoading(false);
                    switch (role) {
                        case "STUDENT":
                            window.location.href = `/home`;
                            break;
                        case "EMPLOYER":
                            window.location.href = `/e-home`;
                            break;
                        case "ADMIN":
                            window.location.href = `/a-home`;
                            break;
                        default:
                            showNotification("Unknown role. Please contact support.", "error");
                            navigate("/");
                            break;
                    }
                }, 1500);
            }
        } catch (error) {
            setIsLoading(false);
            if (error.response && error.response.status === 403) {
                setErrorMessage(error.response.data.message || "Your email is not verified. Please check your inbox.");
                setIsResendSuccess(false);
                setShowErrorPopup(true);
            } else {
                // Show error notification using helper function
                showNotification(
                    error.response?.data?.message || "Login failed. Please try again.", 
                    "error"
                );
                console.log(error.response?.data);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleResendEmail = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:8100/api/user/resend-verification-email?username=${formData.userName}`,
                {
                    headers: { "Content-Type": "application/json" },
                }
            );
            if (response.status === 200) {
                setErrorMessage("Verify mail is resent and check the mail.");
                setIsResendSuccess(true);
                
                // Show success notification using helper function
                showNotification("Verification email has been resent successfully.", "success");
                
                // Close the popup after showing notification
                setShowErrorPopup(false);
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Failed to resend verification email. Please try again.");
            setIsResendSuccess(false);
            
            // Show error notification using helper function
            showNotification(
                error.response?.data?.message || "Failed to resend verification email.",
                "error"
            );
            
            console.log(error.response?.data);
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!forgotPasswordEmail) {
            setForgotPasswordMessage("Please enter your email address.");
            setIsForgotPasswordSuccess(false);
            return;
        }

        setIsLoading(true);
        try {
            const encodedEmail = encodeURIComponent(forgotPasswordEmail);
            const response = await axios.post(
                `http://localhost:8100/api/auth/forgot-password?email=${encodedEmail}`,
                {
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (response.status === 200) {
                setForgotPasswordMessage("Password reset email sent successfully. Please check your inbox.");
                setIsForgotPasswordSuccess(true);
                
                // Show success notification using helper function
                showNotification("Password reset email sent successfully.", "success");
                
                // Close the popup after showing notification
                setTimeout(() => {
                    setShowForgotPasswordPopup(false);
                    setForgotPasswordEmail("");
                    setForgotPasswordMessage("");
                    setIsForgotPasswordSuccess(false);
                }, 1500);
            }
        } catch (error) {
            console.error("Error during forgot password request:", error);
            setForgotPasswordMessage(
                error.response?.data?.message || "Failed to send password reset email. Please try again."
            );
            setIsForgotPasswordSuccess(false);
            
            // Show error notification using helper function
            showNotification(
                error.response?.data?.message || "Failed to send password reset email.",
                "error"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const onNavigateToSignUpPage = () => {
        navigate("/sign-up");
    };

    return (
        <div 
            className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
            style={{ backgroundImage: "url('/Background.png')" }}
        >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>

            <header className="absolute top-4 left-4 sm:top-10 sm:left-10 z-20 text-white">
                <div className="flex items-center space-x-2">
                    <GraduationCap size={40} className="sm:w-12 sm:h-12 text-white" />
                    <span className="text-2xl sm:text-4xl font-bold">Uni Earn</span>
                </div>
                <div className="mt-2 sm:mt-4">
                    <p className="text-lg sm:text-2xl">SIGN IN TO YOUR</p>
                    <p className="text-lg sm:text-2xl font-bold text-blue-500">ADVENTURE!</p>
                </div>
            </header>

            <div className="relative z-20 bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 w-full max-w-md mx-4">
                <div className="text-white text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2">SIGN IN</h2>
                    <p className="mb-6 text-gray-300">Sign in with your user name</p>
                    <form onSubmit={verification} className="space-y-4">
                        <input
                            type="text"
                            placeholder="User Name"
                            className="w-full px-4 py-3 bg-[#261046] text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                            name="userName"
                            required
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full px-4 py-3 bg-[#261046] text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                            name="password"
                            required
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                        <button 
                            type="submit" 
                            className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                    <div className="mt-6 text-gray-300">
                        Don't have an account?{" "}
                        <span 
                            className="text-red-400 font-bold cursor-pointer hover:underline" 
                            onClick={onNavigateToSignUpPage}
                            style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
                        >
                            Sign Up
                        </span>
                        <br />
                        <span
                            className="text-blue-500 cursor-pointer hover:underline"
                            onClick={() => setShowForgotPasswordPopup(true)}
                            style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
                        >
                            Forgot Password
                        </span>
                    </div>
                </div>
            </div>

            {/* Contact Support Button - Fixed at bottom right */}
            <div className="fixed bottom-6 right-6 z-30">
                <button
                    type="button"
                    className="flex items-center justify-center gap-2 text-white bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
                    onClick={() => navigate("/contact-us")}
                    aria-label="Contact Support"
                    title="Need help? Contact support"
                    disabled={isLoading}
                >
                    <Mail size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Support</span>
                </button>
            </div>

            {showErrorPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-11/12 max-w-md text-center relative">
                        <button
                            className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
                            onClick={() => setShowErrorPopup(false)}
                        >
                            <X size={20} />
                        </button>
                        <h2
                            className={`text-lg font-bold mb-4 ${
                                isResendSuccess ? "text-green-600" : "text-red-600"
                            }`}
                        >
                            {isResendSuccess ? "Success" : "Error"}
                        </h2>
                        <p className="text-gray-600 mb-4">{errorMessage}</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                                onClick={handleResendEmail}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    "Resend Email"
                                )}
                            </button>
                            <button
                                className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors"
                                onClick={() => setShowErrorPopup(false)}
                                disabled={isLoading}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showForgotPasswordPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-11/12 max-w-md text-center relative">
                        <button
                            className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
                            onClick={() => {
                                setShowForgotPasswordPopup(false);
                                setForgotPasswordEmail("");
                                setForgotPasswordMessage("");
                                setIsForgotPasswordSuccess(false);
                            }}
                            disabled={isLoading}
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-lg font-bold mb-4 text-gray-800">
                            Forgot Password
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Enter your email to receive a password reset link.
                        </p>
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="w-full px-4 py-3 border rounded-lg mb-4 focus:outline-none focus:border-blue-500"
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                        {forgotPasswordMessage && (
                            <p
                                className={`text-sm mb-4 ${
                                    isForgotPasswordSuccess ? "text-green-600" : "text-red-600"
                                }`}
                            >
                                {forgotPasswordMessage}
                            </p>
                        )}
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                                onClick={handleForgotPassword}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    "Send Email"
                                )}
                            </button>
                            <button
                                className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors"
                                onClick={() => {
                                    setShowForgotPasswordPopup(false);
                                    setForgotPasswordEmail("");
                                    setForgotPasswordMessage("");
                                    setIsForgotPasswordSuccess(false);
                                }}
                                disabled={isLoading}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
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

export default Signin;