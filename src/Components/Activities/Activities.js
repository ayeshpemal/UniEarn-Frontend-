import React, {useState} from "react";
import bgImage from "./bg.png"; // Background Image
import companyLogo from "./job-logo.png";
import {ChatBubbleOvalLeftEllipsisIcon} from "@heroicons/react/24/solid"; // Company Logo


const activities = [
    {
        id: 1,
        company: "K&D Garment",
        description: "Vote activation sampling and selling",
        location: "Piliyandala",
        date: "2024 . 11 . 16",
        logo: companyLogo,
    },{
        id: 2,
        company: "K&D Garment",
        description: "Vote activation sampling and selling",
        location: "Piliyandala",
        date: "2024 . 11 . 16",
        logo: companyLogo,
    },
];

const Activities = () => {

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Hero Section */}
            <div
                className="relative h-[70vh] bg-cover bg-center"
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
           <div className ="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 mt-6">
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
            </div>
        </div>
    );
};

export default Activities;
