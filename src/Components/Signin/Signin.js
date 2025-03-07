import React, { useState } from "react";
import "./signin.css";
import { useNavigate } from "react-router-dom";
import { GraduationCap, X } from "lucide-react";
import axios from "axios";

const Signin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        userName: "",
        password: "",
    });
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isResendSuccess, setIsResendSuccess] = useState(false);

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
                onNavigateToHomePage();
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
                        <span className="text-blue-500 cursor-pointer">Forgot Password</span>
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
        </div>
    );
};

export default Signin;