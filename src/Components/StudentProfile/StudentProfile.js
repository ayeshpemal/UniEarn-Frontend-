import React, { useState } from "react";
import { Edit2, ChevronDown, Star } from "lucide-react";
import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/24/solid";
import bgImage from "./bg.png"; // Background Image
import defaultProfile from "./profile.png"; // Default Profile Picture

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState("");
    const [messageCount, setMessageCount] = useState(3);
    const [profilePic, setProfilePic] = useState(defaultProfile);

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

    // Handle profile picture change
    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setProfilePic(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Toggle edit mode
    const handleEditToggle = () => {
        if (isEditing) {
            if (!validatePasswords()) return;
        }
        setIsEditing(!isEditing);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative h-[400px] bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80")' }}>
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
                        <div className="relative">
                            <img src={profilePic} alt="Profile" className="w-32 h-32 rounded-full border-4 border-white shadow-lg" />
                            {isEditing && (
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfilePictureChange}
                                    className="absolute bottom-0 left-0 w-full opacity-0 cursor-pointer"
                                />
                            )}
                        </div>
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

                        {error && <div className="col-span-2 text-red-500 text-sm">{error}</div>}
                    </div>
                </div>

                {/* Feedback Section */}
                <section>
                    <h2 className="text-2xl font-bold mb-6">Company Feedback</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <FeedbackCard
                            image="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                            name="Floyd Miles"
                            rating={4}
                            review="Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint."
                        />
                        <FeedbackCard
                            image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
                            name="Ronald Richards"
                            rating={4}
                            review="Ullamco est sit aliqua dolor do amet sint."
                        />
                        <FeedbackCard
                            image="https://images.unsplash.com/photo-1639149888905-fb39731f2e6c"
                            name="Savannah Nguyen"
                            rating={3}
                            review="Velit officia consequat duis enim velit mollit."
                        />
                    </div>
                    <div className="flex justify-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    </div>
                </section>
            </div>
            {/* Floating Message Button - Bottom Right */}
                        <button className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition">
                             <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8" />

                            {/* Notification Badge */}
                             {messageCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                        {messageCount}
                    </span>
                )}
             </button>
        </div>
    );
};

// Components
const ProfileField = ({ label, name, value, type = "text", disabled, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <input type={type} name={name} value={value} disabled={disabled} onChange={onChange} className="w-full p-3 border rounded-lg bg-gray-50" />
    </div>
);

function FeedbackCard({ image, name, rating, review }) {
    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-4 mb-4">
                <img src={image} alt={name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                    <h3 className="font-semibold">{name}</h3>
                    <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={16}
                                className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <p className="text-gray-600 text-sm">{review}</p>
        </div>
    );
}

export default Profile;







