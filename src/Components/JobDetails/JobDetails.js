import React, { useState } from "react";
import bgImage from "./bg.png";
import {Search} from "lucide-react";

const jobs = [
    {
        id: 1,
        company: "K&D Garment",
        description:
            "නොවැම්බර් 16 සිට දෙසැම්බර් 7තෙක් vote activation sampling and selling වැඩසටහන සඳහා sales ප්‍රවර්ධන ක්‍රියාවලිය 2ක් පැවැත්වේ.",
        date: "16th December 2024 to 22nd December 2024",
        time: "9.00am to 6.00pm",
        gender: "Female",
        students: 2,
        locations: ["16th-පිළියන්දල"],
        rating: 4.5,
        reviews: "5,291 reviews",
        salary: "Rs.3500.00",
        logo: "/job-logo.png",
    },
];

const JobDetails = () => {
    const [searchLocation, setSearchLocation] = useState("");

    const handleSearch = (e) => {
        setSearchLocation(e.target.value);
    };

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

            {/* Job Listings Section */}
            <section className="max-w-4xl mx-auto p-6">
                <h2 className="text-2xl font-bold mb-4 text-center">Browse by location</h2>

                {jobs.map((job) => (
                    <div key={job.id} className="bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row-reverse relative items-start md:items-center mb-6">

                        {/* Job Logo (Moved to Top Left) */}
                        <div className="absolute top-6 left-6 w-20 h-20">
                            <img src={job.logo} alt="Company Logo" className="rounded-full w-full h-full" />
                        </div>

                        {/* Job Details */}
                        <div className="flex-grow ml-20">
                            <h3 className="text-lg font-bold">{job.company}</h3>
                            <p className="text-gray-600 text-sm">{job.description}</p>

                            <p className="text-gray-700 mt-2">
                                <span className="font-bold">Date:</span> {job.date} <br />
                                <span className="font-bold">Time:</span> {job.time} <br />
                                <span className="font-bold">Gender:</span> {job.gender} <br />
                                <span className="font-bold">No of Students:</span> {job.students}
                            </p>

                            <p className="text-gray-700 mt-2">
                                <span className="font-bold">Locations:</span>{" "}
                                {job.locations.map((loc, index) => (
                                    <span key={index} className="block text-sm text-gray-500">
                                        {loc}
                                    </span>
                                ))}
                            </p>

                            {/* Rating and Salary */}
                            <div className="flex items-center mt-2 text-yellow-400">
                                {"⭐".repeat(Math.floor(job.rating))}{" "}
                                <span className="text-gray-500 text-sm ml-2">{job.reviews}</span>
                            </div>

                            <p className="text-green-600 font-bold mt-1">{job.salary}</p>

                            {/* Apply Now Button */}
                            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg mt-4 md:mt-0 self-center">
                                Apply Now
                            </button>
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
};

export default JobDetails;
