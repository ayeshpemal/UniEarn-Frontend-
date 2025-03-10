import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Check } from "lucide-react";
import axios from "axios";

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token"); // Extract token from URL query parameter

    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: "",
    });
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        validatePasswords(formData.newPassword, value); // Validate as user types
    };

    const validatePasswords = (newPass, confirmPass) => {
        if (!newPass || !confirmPass) {
            setMessage("");
            return;
        }
        if (newPass !== confirmPass) {
            setMessage("Passwords do not match.");
            setIsSuccess(false);
        } else if (newPass.length < 6) {
            setMessage("Password must be at least 6 characters long.");
            setIsSuccess(false);
        } else {
            setMessage("");
            setIsSuccess(true);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        // Validate before API call
        if (!formData.newPassword || !formData.confirmPassword) {
            setMessage("Please fill in both password fields.");
            setIsSuccess(false);
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setMessage("Passwords do not match.");
            setIsSuccess(false);
            return;
        }
        if (formData.newPassword.length < 6) {
            setMessage("Password must be at least 6 characters long.");
            setIsSuccess(false);
            return;
        }

        try {
            const requestBody = {
                token,
                newPassword: formData.newPassword,
            };
            console.log("Request Body:", requestBody); // Debug: Check the request body
            console.log("API URL:", "http://localhost:8100/api/auth/reset-password"); // Debug: Check the URL

            const response = await axios.post(
                "http://localhost:8100/api/auth/reset-password",
                requestBody,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("API Response:", response); // Debug: Log the response

            if (response.status === 200) {
                setMessage("Password reset successfully. Redirecting to sign-in...");
                setIsSuccess(true);
                // Redirect to sign-in page after a short delay
                setTimeout(() => navigate("/sign-in"), 2000);
            }
        } catch (error) {
            console.error("Error during reset password request:", error); // Debug: Log the error
            setMessage(
                error.response?.data?.message || "Failed to reset password. Please try again."
            );
            setIsSuccess(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white rounded-2xl p-6 shadow-lg w-11/12 max-w-md text-center relative">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center justify-center">
                    <Lock size={24} className="mr-2" />
                    Reset Password
                </h2>
                <p className="text-gray-600 mb-6">
                    Enter your new password and confirm it to reset your password.
                </p>
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            name="newPassword"
                            placeholder="New Password"
                            className="w-full px-4 py-3 border rounded-lg"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            className="w-full px-4 py-3 border rounded-lg"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    {message && (
                        <p
                            className={`text-sm mb-4 flex items-center justify-center ${
                                isSuccess ? "text-green-600" : "text-red-600"
                            }`}
                        >
                            {isSuccess ? <Check size={16} className="mr-2" /> : null}
                            {message}
                        </p>
                    )}
                    <button
                        type="submit"
                        className={`w-full py-3 px-6 rounded-lg transition ${
                            isSuccess
                                ? "bg-green-500 hover:bg-green-600 text-white"
                                : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                        disabled={!isSuccess && !!message}
                    >
                        Update Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;