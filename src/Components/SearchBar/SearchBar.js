import { Search } from "lucide-react";
import React, { useState } from "react";

const locations = [
    "All", "AMPARA", "ANURADHAPURA", "BADULLA", "BATTICALOA", "COLOMBO", "GALLE", "GAMPAHA", "HAMBANTOTA", "JAFFNA",
    "KALUTARA", "KANDY", "KEGALLE", "KILINOCHCHI", "KURUNEGALA", "MANNAR", "MATARA", "MATALE", "MONERAGALA",
    "MULLAITIVU", "NUWARA_ELIYA", "POLONNARUWA", "PUTTALAM", "RATNAPURA", "TRINCOMALEE", "VAUNIYA"
];

const jobs = [
    "All", "CASHIER", "SALESMEN", "RETAIL", "TUTORING", "CATERING", "EVENT_BASED", "FOOD_AND_BEVERAGE", "DELIVERY",
    "MASCOT_DANCER", "SUPERVISOR", "KITCHEN_HELPER", "STORE_HELPER", "ANNOUNCER", "LEAFLET_DISTRIBUTOR",
    "TYPING", "DATA_ENTRY", "WEB_DEVELOPER", "OTHER"
];

const SearchBar = () => {
    const [selectedLocation, setSelectedLocation] = useState("All");
    const [selectedJob, setSelectedJob] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = () => {
        alert(`Searching for: ${searchTerm} in ${selectedLocation} for ${selectedJob}`);
    };

    return (
        <div className="mt-6 flex flex-wrap items-center justify-center bg-white rounded-full shadow-md w-full max-w-4xl px-4 py-2">

            {/* Small Location Dropdown */}
            <select
                className="w-20 px-3 py-2 border rounded-full text-gray-700 bg-gray-50 focus:outline-none text-sm mr-2"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
            >
                {locations.map((location, index) => (
                    <option key={index} value={location}>{location}</option>
                ))}
            </select>

            {/* Small Job Dropdown */}
            <select
                className="w-20 px-3 py-2 border rounded-full text-gray-700 bg-gray-50 focus:outline-none text-sm mr-2"
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
            >
                {jobs.map((job, index) => (
                    <option key={index} value={job}>{job}</option>
                ))}
            </select>

            {/* Search Input */}
            <div className="flex items-center w-auto space-x-2">
                <Search size={18} className="text-gray-500" />
                <input
                    type="text"
                    placeholder="Job, Category, Keyword, Company"
                    className="w-full px-4 py-2 text-sm focus:outline-none text-gray-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Search Button */}
            <button
                className="ml-2 bg-blue-600 text-white px-5 py-2 text-sm rounded-full hover:bg-blue-700 transition"
                onClick={handleSearch}
            >
                Search
            </button>
        </div>
    );
};

export default SearchBar;
