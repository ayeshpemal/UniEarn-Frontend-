import React, { useState } from "react";
import "./signin.css";
import { useNavigate } from "react-router-dom";
import { GraduationCap, X } from "lucide-react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

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

    const verification = async (e) => {
        e.preventDefault();
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
                // Decode the token to get the role
                const decoded = jwtDecode(token);
                console.log("Decoded token:", decoded); // Debug: Check token structure
                const role = decoded.role;

                alert("Login Successful!");

                // Navigate based on role
                switch (role) {
                    case "STUDENT":
                        window.location.href = `/home`;
                        break;
                    case "EMPLOYER":
                        window.location.href = `/e-home`;
                        break;
                    case "ADMIN":
                        window.location.href = `/admin`;
                        break;
                    default:
                        alert("Unknown role. Please contact support.");
                        navigate("/"); // Redirect to a default page or handle differently
                        break;
                }
            }
        } catch (error) {
            if (error.response && error.response.status === 403) {
                setErrorMessage(error.response.data.message || "Your email is not verified. Please check your inbox.");
                setIsResendSuccess(false);
                setShowErrorPopup(true);
            } else {
                alert(error.response?.data?.message || "Login failed. Please try again.");
                console.log(error.response?.data);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleResendEmail = async () => {
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
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Failed to resend verification email. Please try again.");
            setIsResendSuccess(false);
            console.log(error.response?.data);
        }
    };

    const handleForgotPassword = async () => {
        if (!forgotPasswordEmail) {
            setForgotPasswordMessage("Please enter your email address.");
            setIsForgotPasswordSuccess(false);
            return;
        }

        try {
            // Encode the email address to handle special characters like '@'
            const encodedEmail = encodeURIComponent(forgotPasswordEmail);
            console.log("Encoded email:", encodedEmail); // Debug: Check the encoded email
            console.log("API URL:", `http://localhost:8100/api/auth/forgot-password?email=${encodedEmail}`); // Debug: Check the full URL

            const response = await axios.post(
                `http://localhost:8100/api/auth/forgot-password?email=${encodedEmail}`,
                {
                    headers: { "Content-Type": "application/json" },
                }
            );

            console.log("API Response:", response); // Debug: Log the response

            if (response.status === 200) {
                setForgotPasswordMessage("Password reset email sent successfully. Please check your inbox.");
                setIsForgotPasswordSuccess(true);
            }
        } catch (error) {
            console.error("Error during forgot password request:", error); // Debug: Log the error
            setForgotPasswordMessage(
                error.response?.data?.message || "Failed to send password reset email. Please try again."
            );
            setIsForgotPasswordSuccess(false);
        }
    };

    const onNavigateToSignUpPage = () => {
        navigate("/sign-up");
    };

    return (
        <div className="signin-container min-h-screen flex items-center justify-center">
            {/* Top-Left Logo, Title, and Text */}
            <header className="absolute top-4 sm:top-10 left-4 sm:left-10 z-10 text-white">
                <div className="flex items-center space-x-2">
                    <GraduationCap size={40} className="sm:size-50 text-white" />
                    <span className="text-2xl sm:text-4xl font-bold">Uni Earn</span>
                </div>
                <div className="mt-2 sm:mt-4">
                    <p className="text-lg sm:text-2xl">SIGN IN TO YOUR</p>
                    <p className="text-lg sm:text-2xl font-bold text-blue-500 highlight">ADVENTURE!</p>
                </div>
            </header>

            {/* Background Overlay */}
            <div className="background-overlay w-full max-w-md mx-4 sm:mx-6 lg:mx-8 py-8">
                {/* Login Form */}
                <div className="login-form">
                    <h2 className="text-2xl sm:text-3xl">SIGN IN</h2>
                    <p className="mb-6">Sign in with your user name</p>
                    <form onSubmit={verification} className="space-y-4">
                        <input
                            type="text"
                            placeholder="User Name"
                            className="form-input w-full px-4 py-3"
                            name="userName"
                            required
                            onChange={handleInputChange}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="form-input w-full px-4 py-3"
                            name="password"
                            required
                            onChange={handleInputChange}
                        />
                        <button type="submit" className="signin-button w-full py-3 px-6">
                            Sign In
                        </button>
                    </form>
                    <div className="signup-link mt-6">
                        Don’t have an account ?{" "}
                        <span className="text-red-400 font-bold cursor-pointer" onClick={onNavigateToSignUpPage}>
                            Sign Up
                        </span>
                        <br />
                        <span
                            className="text-blue-500 cursor-pointer"
                            onClick={() => setShowForgotPasswordPopup(true)}
                        >
                            Forgot Password
                        </span>
                    </div>
                </div>
            </div>

            {/* Error/Success Popup for 403 Error */}
            {showErrorPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 shadow-lg w-11/12 max-w-md text-center relative">
                        <button
                            className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
                            onClick={() => setShowErrorPopup(false)}
                            aria-label="Close"
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
                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <button
                                className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition"
                                onClick={handleResendEmail}
                                aria-label="Resend Email"
                            >
                                Resend Email
                            </button>
                            <button
                                className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition"
                                onClick={() => setShowErrorPopup(false)}
                                aria-label="Close"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Forgot Password Popup */}
            {showForgotPasswordPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 shadow-lg w-11/12 max-w-md text-center relative">
                        <button
                            className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
                            onClick={() => {
                                setShowForgotPasswordPopup(false);
                                setForgotPasswordEmail("");
                                setForgotPasswordMessage("");
                                setIsForgotPasswordSuccess(false);
                            }}
                            aria-label="Close"
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
                            className="w-full px-4 py-3 border rounded-lg mb-4"
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            required
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
                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <button
                                className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition"
                                onClick={handleForgotPassword}
                                aria-label="Send Email"
                            >
                                Send Email
                            </button>
                            <button
                                className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition"
                                onClick={() => {
                                    setShowForgotPasswordPopup(false);
                                    setForgotPasswordEmail("");
                                    setForgotPasswordMessage("");
                                    setIsForgotPasswordSuccess(false);
                                }}
                                aria-label="Close"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Signin;