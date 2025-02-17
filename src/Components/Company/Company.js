import React, { useState } from "react";
import companyLogo from "./job-logo.png"
import {Search} from "lucide-react";
// Replace with actual logo path

const companies = Array(1).fill({
    id: 1,
    name: "K&D Garment",
    logo: companyLogo,
});

const Company = () => {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Hero Section */}
            <header
                className="relative flex flex-col justify-center items-center text-white text-align h-[70vh] bg-cover bg-center px-6"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80")' }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-50" />
                <div className="relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white">
                        Find Your Perfect <br />
                        <span className="text-blue-400">Part-Time</span> Job
                    </h1>

                    {/* Search Bar */}
                    <div className="mt-6 flex items-center bg-white rounded-full shadow-md w-full max-w-xl px-4 py-2">
                        <Search size={20} className="text-gray-500" />
                        <input
                            type="text"
                            placeholder="Job, Category, Keyword, Company"
                            className="w-full px-4 py-2 focus:outline-none text-gray-700"
                        />
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-full">
                            Search
                        </button>
                    </div>
                </div>
            </header>

            {/* Companies Section */}
            <section className ="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 mt-6">
                <h2 className="text-2xl font-bold mb-4">Companies</h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {companies.map((company, index) => (
                        <div key={index} className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center">
                            <img src={company.logo} alt={company.name} className="w-16 h-16 rounded-full" />
                            <h3 className="text-md font-semibold text-gray-700 mt-2">{company.name}</h3>
                            <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded-full flex items-center hover:bg-green-600 transition-colors">
                                View Deal
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Company;
