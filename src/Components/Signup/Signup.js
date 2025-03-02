import React, { useState } from "react";
import "./Signup.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { X } from "lucide-react";

const Signup = () => {
    const navigate = useNavigate();
    const [showVerificationPopup, setShowVerificationPopup] = useState(false);

    const [formData, setFormData] = useState({
        userName: "",
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
                    contactNumbers: value.split(",").map((num) => num.trim()), // Convert CSV input to arraya(07612333,12143214134)
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

        try {
            const response = await axios.post(
                "http://localhost:8100/api/user/register",
                formData,
                {
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (response.status === 201) {
                console.log(response.data);
                setShowVerificationPopup(true);
            }
        } catch (error) {
            alert(error.response?.data?.message || "Registration failed. Please try again.");
            console.log(error.response?.data);
        }
    };


    const handleNextButton = () => {
        setShowVerificationPopup(false);
        navigate("/sign-in");
    };

    return (
        <div className="relative w-full h-screen bg-cover bg-center signin-container">
            <header className="absolute top-10 left-10 z-10 text-white">
                <h1 className="text-4xl font-bold">SIGN UP TO YOUR</h1>
                <p className="text-4xl font-bold text-blue-500">ADVENTURE!</p>
            </header>


            <div className="relative z-20 flex flex-col items-center justify-center h-full">
                <div className="bg-opacity-90 rounded-lg p-8 w-11/12 max-w-4xl">
                    <h2 className="text-white text-3xl font-bold mb-6 text-center">SIGN UP</h2>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
                        {/* Full Name */}
                        <div>
                            <input
                                type="text"
                                placeholder="Full Name"
                                className="form-input w-full px-4 py-3 rounded-lg placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-color"
                                name="userName"
                                required
                                onChange={handleInputChange}
                                value={formData.userName}
                            />
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
                            <input
                                type="text"
                                placeholder="Address"
                                className="form-input w-full px-4 py-3 rounded-lg text-color focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="location"
                                required
                                onChange={handleInputChange}
                                value={formData.location}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                className="form-input w-full px-4 py-3 rounded-lg text-color focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="password"
                                required
                                onChange={handleInputChange}
                                value={formData.password}
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
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
                        <div className="col-span-2 mt-6 text-center">
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-6 rounded-lg font-bold hover:opacity-90"
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
                        <div className="bg-white rounded-2xl p-6 shadow-lg w-auto text-center relative">
                            {/* Close Button */}
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
            </div>
        </div>
    );
};

export default Signup;
