import React, { useState } from "react";
import { Edit2, ChevronDown, Star } from "lucide-react";
import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/24/solid";
import bgImage from "./bg.png"; // Background Image
import userProfile from "./profile.png"; // Profile Picture

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(""); // Store password error message
    const [messageCount, setMessageCount] = useState(2); // Simulated unread messages

    // User Profile State
    const [profile, setProfile] = useState({
        fullName: "Aathif Mohamed",
        mail: "aathifmhd2000@gmail.com",
        university: "University of Ruhuna",
        gender: "Male",
        mobileNo: "0779981298",
        emergencyMobileNo: "0779981298",
        address: "No 53/B Akurana, Kandy",
        password: "",
        confirmPassword: "",
        bio: "",
    });

    // Handle input change
    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    // Handle gender change
    const handleGenderChange = (e) => {
        setProfile({ ...profile, gender: e.target.value });
    };

    // Validate passwords
    const validatePasswords = () => {
        if (profile.password && profile.confirmPassword && profile.password !== profile.confirmPassword) {
            setError("Passwords do not match");
            return false;
        } else {
            setError("");
            return true;
        }
    };

    // Toggle edit mode
    const handleEditToggle = () => {
        if (isEditing) {
            if (!validatePasswords()) return; // Prevent saving if passwords don't match
        }
        setIsEditing(!isEditing);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div
                className="relative h-[400px] bg-cover bg-center"
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center px-6">
                    <h1 className="text-7xl font-bold text-white">
                        Welcome,<br />
                        <span className="text-[#6B7AFF]">{profile.fullName}</span>
                    </h1>
                </div>
            </div>

            {/* Profile Section */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="bg-white rounded-3xl shadow-lg p-8 mb-12">
                    {/* Profile Header */}
                    <div className="flex items-center space-x-6 mb-8">
                        <img src={userProfile} alt="Profile" className="w-32 h-32 rounded-full border-4 border-white shadow-lg" />
                        <div>
                            <h2 className="text-2xl font-bold">{profile.fullName}</h2>
                            <p className="text-gray-600">{profile.mail}</p>
                        </div>
                        <button
                            onClick={handleEditToggle}
                            className={`px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors ${
                                isEditing ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"
                            } text-white`}
                        >
                            <Edit2 size={18} />
                            <span>{isEditing ? "Save" : "Edit"}</span>
                        </button>
                    </div>

                    {/* Profile Form */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                            <textarea
                                className="w-full p-3 border rounded-lg bg-gray-50"
                                rows={4}
                                disabled={!isEditing}
                                name="bio"
                                value={profile.bio}
                                onChange={handleChange}
                                placeholder="Write something about yourself..."
                            />
                        </div>

                        <ProfileField label="Full Name" name="fullName" value={profile.fullName} disabled={!isEditing} onChange={handleChange} />
                        <ProfileField label="University" value={profile.university} disabled={true} />

                        {/* Gender Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                            <div className="relative">
                                <select
                                    name="gender"
                                    value={profile.gender}
                                    onChange={handleGenderChange}
                                    disabled={!isEditing}
                                    className="w-full p-3 border rounded-lg bg-gray-50 appearance-none"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        <ProfileField label="Mobile No" name="mobileNo" value={profile.mobileNo} disabled={!isEditing} onChange={handleChange} />
                        <ProfileField label="Emergency Mobile No" name="emergencyMobileNo" value={profile.emergencyMobileNo} disabled={!isEditing} onChange={handleChange} />
                        <ProfileField label="Address" name="address" value={profile.address} disabled={!isEditing} onChange={handleChange} />

                        {/* Password Fields with Validation */}
                        <ProfileField label="Password" name="password" type="password" value={profile.password} disabled={!isEditing} onChange={handleChange} />
                        <ProfileField label="Confirm Password" name="confirmPassword" type="password" value={profile.confirmPassword} disabled={!isEditing} onChange={handleChange} />

                        {/* Error Message for Password Mismatch */}
                        {error && (
                            <div className="col-span-2 text-red-500 text-sm">{error}</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Message Button */}
            <button className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition">
                <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8" />
                {messageCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                        {messageCount}
                    </span>
                )}
            </button>
        </div>
    );
};

// Profile Field Component
const ProfileField = ({ label, name, value, type = "text", disabled, onChange }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                disabled={disabled}
                onChange={onChange}
                className="w-full p-3 border rounded-lg bg-gray-50"
            />
        </div>
    );
};

export default Profile;
