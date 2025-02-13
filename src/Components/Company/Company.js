import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import bgImage from "./bg.png"; // Background Image
import companyLogo from "./job-logo.png"
import {ChatBubbleOvalLeftEllipsisIcon} from "@heroicons/react/24/solid";
// Replace with actual logo path

const companies = Array(1).fill({
    id: 1,
    name: "K&D Garment",
    logo: companyLogo,
});

const Company = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [messageCount, setMessageCount] = useState(2); // Simulated unread messages

    return (
        <div className="bg-gray-100 min-h-screen">



            {/* Hero Section */}
            <header
                className="relative flex flex-col justify-center items-center text-white text-align"
                style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    width: "auto",
                    height: "600px",
                    flexShrink: "0",
                }}
            >
                <h1 className="text-2xl md:text-7xl font-bold text-center">
                    Find Your Perfect <br />
                    <span className="text-blue-500">Part-Time Job</span>
                </h1>

                {/* Search Bar */}
                <div className="flex bg-white rounded-full p-2 mt-6 w-full max-w-md">
                    <input
                        type="text"
                        placeholder="Job, Category, Keyword, Company"
                        className="flex-grow p-2 outline-none text-black"
                    />
                    <button className="search-container text-white px-6 py-2 rounded-full">
                        Search
                    </button>
                </div>
            </header>

            {/* Companies Section */}
            <section className="max-w-6xl mx-auto p-6">
                <h2 className="text-2xl font-bold mb-4">Companies</h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {companies.map((company, index) => (
                        <div key={index} className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center">
                            <img src={company.logo} alt={company.name} className="w-16 h-16 rounded-full" />
                            <h3 className="text-md font-semibold text-gray-700 mt-2">{company.name}</h3>
                            <button className="mt-2 border border-green-500 text-green-500 px-4 py-2 rounded-lg font-medium hover:bg-green-500 hover:text-white transition">
                                View Deal
                            </button>
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

export default Company;
