import React, {useState} from "react";
import bgImage from "./bg.png"; // Background Image
import companyLogo from "./job-logo.png"; // Company Logo
import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/24/solid"; // HeroIcons for chat bubble

const activities = [
    {
        id: 1,
        company: "K&D Garment",
        description: "Vote activation sampling and selling",
        location: "Piliyandala",
        date: "2024 . 11 . 16",
        logo: companyLogo,
    },
];

const Activities = () => {
    const [messageCount, setMessageCount] = useState(2); // Simulated unread messages
    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Hero Section */}
            <div
                className="relative h-[400px] bg-cover bg-center"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80")' }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-50">
                    <div className="max-w-7xl mx-auto h-full flex flex-col justify-center px-6">
                        <h1 className="text-4xl md:text-6xl font-bold text-white">
                            My,<br/> <span className="text-blue-400">Activities</span>
                        </h1>
                    </div>
                </div>
            </div>

            {/* Activities List - Placed Directly Under Hero Section */}
            <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 mt-6">
                <h2 className="text-2xl font-bold mb-4">Activities</h2>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                        <thead>
                        <tr className="bg-gray-100 text-gray-700 text-left">
                            <th className="px-6 py-3">Company</th>
                            <th className="px-6 py-3">Location</th>
                            <th className="px-6 py-3">Date</th>
                        </tr>
                        </thead>
                        <tbody>
                        {activities.map((activity) => (
                            <tr key={activity.id} className="border-t">
                                <td className="px-6 py-4 flex items-center">
                                    <img
                                        src={activity.logo}
                                        alt="Company Logo"
                                        className="w-12 h-12 rounded-full mr-4"
                                    />
                                    <div>
                                        <p className="font-semibold">{activity.company}</p>
                                        <p className="text-gray-600 text-sm">
                                            {activity.description}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-semibold">{activity.location}</td>
                                <td className="px-6 py-4">{activity.date}</td>
                            </tr>
                        ))}

                        </tbody>
                    </table>
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
        </div>
    );
};

export default Activities;
