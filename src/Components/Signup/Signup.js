import React, { useState } from "react";
import "./Signup.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { X } from "lucide-react";

const ADDRESS_OPTIONS = [
    "AMPARA", "ANURADHAPURA", "BADULLA", "BATTICALOA", "COLOMBO", "GALLE",
    "GAMPAHA", "HAMBANTOTA", "JAFFNA", "KALUTARA", "KANDY", "KEGALLE",
    "KILINOCHCHI", "KURUNEGALA", "MANNAR", "MATARA", "MATALE", "MONERAGALA",
    "MULLAITIVU", "NUWARA_ELIYA", "POLONNARUWA", "PUTTALAM", "RATNAPURA",
    "TRINCOMALEE", "VAUNIYA"
];

const Signup = () => {
    const navigate = useNavigate();
    const [showVerificationPopup, setShowVerificationPopup] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isResendSuccess, setIsResendSuccess] = useState(false);

    const [formData, setFormData] = useState({
        userName: "",
        displayName: "", // Still in state but not shown in UI
        email: "",
        password: "",
        confirmPassword: "",
        role: "STUDENT",
        university: "",
        gender: "",
        location: "",
        contactNumbers: [],
        skills:[],
        preferences:[],
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            if (name === "contactNumbers") {
                return {
                    ...prev,
                    contactNumbers: value.split(",").map((num) => num.trim()),
                };
            } else {
                return {
                    ...prev,
                    [name]: value,
                };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // Set displayName to match userName before submitting
        const submitData = {
            ...formData,
            displayName: formData.userName
        };

        try {
            const response = await axios.post(
                "http://localhost:8100/api/user/register",
                submitData,
                {
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (response.status === 201) {
                console.log(response.data);
                setShowVerificationPopup(true);
            }
        } catch (error) {
            if (error.response && error.response.status === 500) {
                setErrorMessage(error.response.data.message || "Failed to send verification email. Please try again.");
                setIsResendSuccess(false);
                setShowErrorPopup(true);
            } else {
                alert(error.response?.data?.message || "Registration failed. Please try again.");
                console.log(error.response?.data);
            }
        }
    };

    const handleNextButton = () => {
        setShowVerificationPopup(false);
        navigate("/sign-in");
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
                setErrorMessage("Verification email resent successfully. Please check your inbox.");
                setIsResendSuccess(true);
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Failed to resend verification email. Please try again.");
            setIsResendSuccess(false);
            console.log(error.response?.data);
        }
    };

    return (
        <div className="relative w-full min-h-screen bg-cover bg-center signin-container flex items-center justify-center">
            <header className="absolute top-4 sm:top-10 left-4 sm:left-10 z-10 text-white">
                <h1 className="text-2xl sm:text-4xl font-bold">SIGN UP TO YOUR</h1>
                <p className="text-2xl sm:text-4xl font-bold text-blue-500">ADVENTURE!</p>
            </header>

            <div className="relative z-20 w-full max-w-5xl mx-4 sm:mx-6 lg:mx-8 py-8">
                <div className="rounded-lg p-6 sm:p-8">
                    <h2 className="text-white text-2xl sm:text-3xl font-bold mb-6 text-center">SIGN UP</h2>
                    <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={handleSubmit}>
                        {/* User Name */}
                        <div>
                            <input
                                type="text"
                                placeholder="User Name"
                                className="form-input w-full px-4 py-3 rounded-lg placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-color"
                                name="userName"
                                required
                                onChange={handleInputChange}
                                value={formData.userName}
                            />
                        </div>

                        {/* University */}
                        <div>
                            <select
                                className="form-input w-full px-4 py-3 rounded-lg text-color focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="university"
                                required
                                onChange={handleInputChange}
                                value={formData.university}
                            >
                                <option value="">Choose Your University</option>
                                <option value="University of Colombo">University of Colombo</option>
                                <option value="University of Peradeniya">University of Peradeniya</option>
                                <option value="University of Sri Jayewardenepura">University of Sri Jayewardenepura</option>
                                <option value="University of Kelaniya">University of Kelaniya</option>
                                <option value="University of Moratuwa">University of Moratuwa</option>
                                <option value="University of Jaffna">University of Jaffna</option>
                                <option value="University of Ruhuna">University of Ruhuna</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Email */}
                        <div>
                            <input
                                type="email"
                                placeholder="University Email"
                                className="form-input w-full px-4 py-3 rounded-lg text-color focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="email"
                                required
                                onChange={handleInputChange}
                                value={formData.email}
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <select
                                className="form-input w-full px-4 py-3 rounded-lg text-color focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="gender"
                                required
                                onChange={handleInputChange}
                                value={formData.gender}
                            >
                                <option value="">Gender</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                            </select>
                        </div>

                        {/* Contact Number */}
                        <div>
                            <input
                                type="text"
                                placeholder="Mobile No"
                                className="form-input w-full px-4 py-3 rounded-lg text-color focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="contactNumbers"
                                required
                                onChange={handleInputChange}
                                value={formData.contactNumbers}
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <select
                                className="form-input w-full px-4 py-3 rounded-lg text-color focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="location"
                                required
                                onChange={handleInputChange}
                                value={formData.location}
                            >
                                <option value="">Select Address</option>
                                {ADDRESS_OPTIONS.map((address) => (
                                    <option key={address} value={address}>
                                        {address}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Password and Confirm Password in same row */}
                        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                type="password"
                                placeholder="Password"
                                className="form-input w-full px-4 py-3 rounded-lg text-color focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="password"
                                required
                                onChange={handleInputChange}
                                value={formData.password}
                            />
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                className="form-input w-full px-4 py-3 rounded-lg text-color focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="confirmPassword"
                                required
                                onChange={handleInputChange}
                                value={formData.confirmPassword}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="col-span-1 sm:col-span-2 mt-6 text-center">
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-6 rounded-lg font-bold hover:opacity-90 w-full sm:w-auto"
                            >
                                Submit
                            </button>
                        </div>
                    </form>

                    {/* Sign In Button */}
                    <div className="mt-6 text-center">
                        <p className="signin-link text-gray-200">
                            Already have an account?{" "}
                            <span className="text-red-400 font-bold cursor-pointer" onClick={() => navigate("/sign-in")}>
                                Sign In
                            </span>
                        </p>
                    </div>
                </div>

                {/* Email Verification Popup */}
                {showVerificationPopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white rounded-2xl p-6 shadow-lg w-11/12 max-w-md text-center relative">
                            <button
                                className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
                                onClick={() => setShowVerificationPopup(false)}
                            >
                                <X size={20} />
                            </button>
                            <h2 className="text-lg font-bold mb-4">Verification</h2>
                            <p className="text-gray-600 mb-4">Check your email for the verification email.</p>
                            <button
                                className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition"
                                onClick={handleNextButton}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {/* Error/Success Popup for 500 Error */}
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
        </div>
    );
};

export default Signup;