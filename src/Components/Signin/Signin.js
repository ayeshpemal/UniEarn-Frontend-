import React, { useState } from "react";
import "./signin.css";
import { useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import axios from "axios";
import { X } from "lucide-react"; // Import X icon for closing popup

const Signin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        userName: "",
        password: "",
    });
    const [showErrorPopup, setShowErrorPopup] = useState(false); // State for error popup
    const [errorMessage, setErrorMessage] = useState(""); // State for error message
    const [isResendSuccess, setIsResendSuccess] = useState(false); // New state to track resend success

    const onNavigateToHomePage = () => {
        navigate("/home");
    };

    const onNavigateToSignUpPage = () => {
        navigate("/sign-up");
    };

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
            localStorage.setItem("token", response.data.data);

            if (response.status === 200) {
                alert("Login Successful!");
                onNavigateToHomePage(); // Redirect to Home Page after success
            }
        } catch (error) {
            if (error.response && error.response.status === 403) {
                // Handle 403 error (unverified email)
                setErrorMessage(error.response.data.message || "Your email is not verified. Please check your inbox.");
                setIsResendSuccess(false); // Reset success state
                setShowErrorPopup(true);
            } else {
                // Other errors
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
                setIsResendSuccess(true); // Set success state
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Failed to resend verification email. Please try again.");
            setIsResendSuccess(false); // Ensure success state is false on failure
            console.log(error.response?.data);
        }
    };

    return (
        <div className="signin-container">
            {/* Top-Left Logo, Title, and Text */}
            <header className="header">
                <div className="flex items-center space-x-2">
                    <GraduationCap size={50} className="text-white" />
                    <span className="text-4xl font-bold">Uni Earn</span>
                </div>

                <div className="top-left-text">
                    <p>SIGN IN TO YOUR</p>
                    <p className="highlight">ADVENTURE!</p>
                </div>
            </header>

            {/* Background Overlay */}
            <div className="background-overlay">
                {/* Login Form */}
                <div className="login-form">
                    <h2>SIGN IN </h2>
                    <p>Sign in with your user name</p>
                    <form onSubmit={verification}>
                        <input
                            type="text"
                            placeholder="User Name"
                            className="form-input"
                            name="userName"
                            required
                            onChange={handleInputChange}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="form-input"
                            name="password"
                            required
                            onChange={handleInputChange}
                        />

                        <button type="submit" className="signin-button">
                            Sign In
                        </button>
                    </form>
                    <div className="signup-link">
                        Don’t have an account ?{" "}
                        <span className="text-red-400 font-bold cursor-pointer" onClick={onNavigateToSignUpPage}>
                            Sign Up
                        </span>
                        <br />
                        <span className="text-blue-500 cursor-pointer">Forgot Password</span>
                    </div>
                </div>
            </div>

            {/* Error/Success Popup for 403 Error */}
            {showErrorPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 shadow-lg w-auto text-center relative">
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
                        <div className="flex justify-center space-x-4">
                            <button
                                className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition"
                                onClick={handleResendEmail}
                                aria-label="Resend Email"
                            >
                                Resend Email
                            </button>
                            <button
                                className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600"
                                onClick={() => setShowErrorPopup(false)}
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