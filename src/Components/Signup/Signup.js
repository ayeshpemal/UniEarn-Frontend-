import React, { useState } from "react";
import "./Signup.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {

    const navigate = useNavigate();
    const [showPinPopup, setShowPinPopup] = useState(false);
    const [pin, setPin] = useState(["", "", "", "", "", ""]);
    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        password: "",
        role: "STUDENT",
        university: "",
        gender: "",
        skills: [],
        preferences: [],
        location: "",
        contactNumbers: [],        
    });

    const onNavigateToSignIn = () => {
        navigate("/sign-in");
    }
    const handlePinChange = (index, value) => {
        if (value.length > 1) return; // Only allow single digit input
        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);
    };

    // Handle Next Button (Open PIN Popup)
    const handleNextClick = (e) => {
        e.preventDefault();
        const requiredFields = ["userName","email","password","role","university","gender","skills","preferences","location","contactNumbers"];
    
        for (const field of requiredFields) {
            if (!formData[field]) {
                alert(`${field} is required!`);
                return;
            }
        }
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        setShowPinPopup(true);
    };

    // Handle Create Account Button
    const handleCreateAccount = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                "http://localhost:8100/api/user/register",
                formData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 201) {
                console.log(response.data);
                alert("Account Created Successfully!");
                onNavigateToSignIn(); // Redirect to Home Page after success
            }
        } catch (error) {
            alert(error.response?.data?.message || "Registration failed. Please try again.");
            console.log(error.response?.data);
            //window.location.reload();
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };


    return (
        <div className="relative w-full h-screen bg-cover bg-center signin-container" >
            {/* Header */}
            <header className="absolute top-10 left-10 z-10 text-white">
                <h1 className="text-4xl font-bold">SIGN UP TO YOUR</h1>
                <p className="text-4xl font-bold text-blue-500">ADVENTURE!</p>
            </header>

            {/* Signup Form */}
            <div className="relative z-20 flex flex-col items-center justify-center h-full">
                <div className="bg-opacity-90 rounded-lg p-8 w-11/12 max-w-4xl">
                    <h2 className="text-white text-3xl font-bold mb-6 text-center">SIGN UP</h2>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleNextClick}>
                        {/* First Name */}
                        <div>
                            <input
                                type="text"
                                placeholder="First Name"
                                className="w-full px-4 py-3 rounded-lg placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-color"
                                name="userName"
                                required
                                onChange={handleInputChange}
                            />
                        </div>
                        {/* Last Name */}
                        <div className="text-color">
                            <input
                                type="text"
                                placeholder="Last Name"
                                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                //name="lastName"
                                required
                                onChange={handleInputChange}
                            />
                        </div>
                        {/* University */}
                        <div>
                            <select
                                className="w-full px-4 py-3 rounded-lg text-color focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="university"
                                required
                                onChange={handleInputChange}
                            >
                                <option value="" >
                                    Choose Your University
                                </option>
                                <option value="university of Colombo">University of Colombo</option>
                                <option value="university of Peradeniya">University of Peradeniya</option>
                                <option value="university of Sri Jayewardenepura">University of Sri Jayewardenepura</option>
                                <option value="university of Kelaniya">University of Kelaniya</option>
                                <option value="university of Moratuwa">University of Moratuwa</option>
                                <option value="university of Jaffna">University of Jaffna</option>
                                <option value="university of Ruhuna">University of Ruhuna</option>
                                <option value="The Open University of Sri Lanka">The Open University of Sri Lanka</option>
                                <option value="Eastern University, Sri Lanka">Eastern University, Sri Lanka</option>
                                <option value="South Eastern University of Sri Lanka">South Eastern University of Sri Lanka</option>
                                <option value="Rajarata University of Sri Lanka">Rajarata University of Sri Lanka</option>
                                <option value="Sabaragamuwa University of Sri Lanka">Sabaragamuwa University of Sri Lanka</option>
                                <option value="Wayamba University of Sri Lanka">Wayamba University of Sri Lanka</option>
                                <option value="Uva Wellassa University">Uva Wellassa University</option>
                                <option value="University of the Visual & Performing Arts">University of the Visual & Performing Arts</option>
                                <option value="Gampaha Wickramarachchi University of Indigenous Medicine">Gampaha Wickramarachchi University of Indigenous Medicine</option>
                                <option value="Institute of Technology University of Moratuwa">Institute of Technology University of Moratuwa</option>
                                <option value="University of Vauniya, Sri Lanka">University of Vauniya, Sri Lanka</option>
                                <option value="University of Vocational Technology">University of Vocational Technology</option>
                                <option value="Buddhist and Pali University">Buddhist and Pali University</option>
                                <option value="Ocean University of Sri Lanka">Ocean University of Sri Lanka</option>
                                <option value="Buddhasravaka Bhiksu University">Buddhasravaka Bhiksu University</option>
                                <option value="Sri Lanka Institute of Information Technology (SLIIT)">Sri Lanka Institute of Information Technology (SLIIT)</option>
                                <option value="General Sir John Kotelawala Defence University">General Sir John Kotelawala Defence University</option>
                                <option value="Sri Lanka Technological Campus">Sri Lanka Technological Campus</option>
                                <option value="NSBM Green University">NSBM Green University</option>
                                <option value="Informatics Institute of Technology Sri Lanka">Informatics Institute of Technology Sri Lanka</option>
                                <option value="SLINTEC Academy">SLINTEC Academy</option>
                                <option value="International College of Business and Technology">International College of Business and Technology</option>
                                <option value="National Institute of Business Management (NIBM)">National Institute of Business Management (NIBM)</option>
                                <option value="CINEC Campus">CINEC Campus</option>
                                <option value="Institute of Higher National Diploma in Engineering (HNDE)">Institute of Higher National Diploma in Engineering (HNDE)</option>
                                <option value="Java Institute For Advanced Technology">Java Institute For Advanced Technology</option>
                                <option value="Other universities">Other universities</option>
                                {/* Add more universities here */}
                            </select>
                        </div>
                        {/* University Mail */}
                        <div>
                            <input
                                type="email"
                                placeholder="University Mail"
                                className="w-full px-4 py-3 rounded-lg text-color focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="email"
                                required
                                onChange={handleInputChange}
                            />
                        </div>
                        {/* Mobile No */}
                        <div>
                            <input
                                type="text"
                                placeholder="Mobile No"
                                className="w-full px-4 py-3 rounded-lg text-color  focus:outline-none focus:ring-2 focus:ring-blue-500"
                                //name="mobile"
                                required
                                onChange={handleInputChange}
                            />
                        </div>
                        {/* Emergency Mobile No */}
                        <div>
                            <input
                                type="text"
                                placeholder="Emergency Mobile No"
                                className="w-full px-4 py-3 rounded-lg text-color focus:outline-none focus:ring-2 focus:ring-blue-500"
                                //name="contactNumbers"
                                required
                                onChange={handleInputChange}
                            />
                        </div>
                        {/* Address */}
                        <div>
                            <input
                                type="text"
                                placeholder="Address"
                                className="w-full px-4 py-3 rounded-lg text-color focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="location"
                                required
                                onChange={handleInputChange}
                            />
                        </div>
                        {/* Gender */}
                        <div>
                            <select
                                className="w-full px-4 py-3 rounded-lg text-color focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="gender"
                                required
                                onChange={handleInputChange}
                            >
                                <option value="">Gender</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                            </select>
                        </div>
                        {/* Password */}
                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full px-4 py-3 rounded-lg text-color focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="password"
                                required
                                onChange={handleInputChange}
                            />
                        </div>
                        {/* Confirm Password */}
                        <div>
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                className="w-full px-4 py-3 rounded-lg text-color focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="confirmPassword"
                                required
                                onChange={handleInputChange}
                            />
                        </div>
                        {/* Submit Button */}
                        <div className="mt-6 text-center">
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-6 rounded-lg font-bold hover:opacity-90"
                            >
                                Next
                            </button>
                        </div>
                    </form>
                    {/* SignIn Button */}
                    <div className="mt-6 text-center">
                        <p className="signin-link">
                            Don’t have an account? <a onClick={onNavigateToSignIn} className="text-blue-400 font-bold">Sign In</a>
                        </p>
                    </div>
                </div>
                {showPinPopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-purple-950 rounded-2xl p-6 shadow-lg w-auto">
                            <h2 className="text-lg font-bold text-white mb-4">PIN</h2>
                            <p className="text-gray-200 mb-4">Enter 6-digit verification code sent to your phone number</p>

                            {/* PIN Input Boxes */}
                            <div className="flex justify-center space-x-2">
                                {pin.map((digit, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        value={digit}
                                        maxLength="1"
                                        className="w-12 h-12 text-xl text-center border rounded-lg"
                                        onChange={(e) => handlePinChange(index, e.target.value)}
                                    />
                                ))}
                            </div>

                            {/* Create Account Button */}
                            <div className="mt-6 text-center">
                                <button
                                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-6 rounded-lg font-bold hover:opacity-90 w-full"
                                    onClick={handleCreateAccount}
                                >
                                    Create Account
                                </button>
                            </div>

                            {/* Resend Code */}
                            <p className="text-red-500 text-sm text-center mt-3 cursor-pointer hover:underline">Resend Code</p>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default Signup;
