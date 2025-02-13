import React, { useState } from "react";
import bgImage from "./bg.png"; // Background Image
import userProfile from "./profile.png"; // Profile Picture
import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/24/solid"; // HeroIcons for chat bubble

const feedbacks = [
    { id: 1, name: "Floyd Miles", feedback: "Great experience with this company!", rating: 4, image: "/Rating.png" },
    { id: 2, name: "Ronald Richards", feedback: "Awesome work culture and support!", rating: 5, image: "/Rating.png" },
    { id: 3, name: "Savannah Nguyen", feedback: "Highly recommend this workplace!", rating: 4, image: "/Rating.png" },
];

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [messageCount, setMessageCount] = useState(2); // Simulated unread messages

    // User Profile State
    const [profile, setProfile] = useState({
        bio: "",
        fullName: "Aathif Mohamed",
        university: "University of Ruhuna",
        gender: "Male",
        mobileNo: "0779981298",
        emergencyMobileNo: "0779981298",
        address: "No 53/B Akurana, Kandy",
        password: "********",
        confirmPassword: "********",
    });

    // Handle input change
    const handleChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value,
        });
    };

    // Toggle edit mode
    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    return (
        <div className="bg-gray-100 min-h-screen relative">
            {/* Hero Section */}
            <header
                className="relative flex flex-col justify-center items-start text-white h-[70vh] bg-cover bg-center px-10 md:px-20"
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-7xl font-bold">
                        Welcome,<br/> <span className="text-blue-400">{profile.fullName}</span>
                    </h1>
                </div>
            </header>

            {/* Profile Card */}
            <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md -mt-20 p-6 relative z-10">
                <div className="flex items-center justify-between relative">
                    {/* Profile Image and Name Section */}
                    <div className="flex items-center space-x-4 relative z-20">
                        {/* Profile Image */}
                        <img src={userProfile} alt="Profile"
                             className="w-32 h-32 rounded-full border-4 border-white shadow-lg" />

                        {/* User Details (Full Name & Mobile No) */}
                        <div>
                            <h2 className="text-2xl font-bold">{profile.fullName}</h2>
                            <p className="text-gray-500 text-lg">{profile.mobileNo}</p>
                        </div>
                    </div>

                    {/* Edit / Save Button */}
                    <button
                        onClick={handleEditToggle}
                        className={`px-6 py-2 rounded-lg font-medium transition z-20 ${
                            isEditing ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"
                        } text-white`}>
                        {isEditing ? "Save" : "Edit"}
                    </button>
                </div>

                {/* Editable Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 relative z-10">
                    <textarea
                        name="bio"
                        className="border p-3 rounded w-full h-24"
                        placeholder="Bio"
                        value={profile.bio}
                        onChange={handleChange}
                        disabled={!isEditing}
                    ></textarea>

                    <input
                        type="text"
                        name="fullName"
                        className="border p-3 rounded w-full"
                        placeholder="Full Name"
                        value={profile.fullName}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />

                    <input
                        type="text"
                        name="university"
                        className="border p-3 rounded w-full"
                        placeholder="University"
                        value={profile.university}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />

                    <input
                        type="text"
                        name="gender"
                        className="border p-3 rounded w-full"
                        placeholder="Gender"
                        value={profile.gender}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />

                    <input
                        type="text"
                        name="mobileNo"
                        className="border p-3 rounded w-full"
                        placeholder="Mobile No"
                        value={profile.mobileNo}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </div>
            </div>

            {/* Company Feedback Section */}
            <section className="max-w-6xl mx-auto p-6 relative z-10">
                <h2 className="text-2xl font-bold mb-4">Company Feedback</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {feedbacks.map((feedback) => (
                        <div key={feedback.id} className="bg-white shadow-md rounded-lg p-4 flex flex-col">
                            <div className="flex items-center">
                                <img src={feedback.image} alt={feedback.name} className="w-12 h-12 rounded-full" />
                                <div className="ml-3">
                                    <h3 className="text-md font-semibold">{feedback.name}</h3>
                                    <div className="text-yellow-400">
                                        {"⭐".repeat(feedback.rating)}
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm mt-2">{feedback.feedback}</p>
                        </div>
                    ))}
                </div>
            </section>

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

export default Profile;
