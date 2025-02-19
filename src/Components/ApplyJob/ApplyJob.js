import React, { useState } from "react";
import { Star, UserPlus, Save } from "lucide-react";
import SearchBar from "../SearchBar/SearchBar";

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
    const [members, setMembers] = useState([
        {
            id: 1,
            name: "Aathif Mohamed",
            location: "Piliyandala",
            rating: 4,
        }
    ]);


    const removeMember = (id) => {
        setMembers(members.filter(member => member.id !== id));
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

                    <SearchBar/>
                </div>
            </header>
            <div className="max-w-6xl mx-auto px-6">


                {/* Job Details */}
                <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 mt-6">
                    <h2 className="text-2xl font-bold text-center mb-4">Job</h2>
                    {jobs.map((job) => (
                        <div className="flex items-start space-x-4">
                            <img
                                src={job.logo}
                                alt="Company Logo"
                                className="w-16 h-16 rounded-full"
                            />
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold">{job.company}</h3>
                                <p className="text-gray-600">
                                    {job.description}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    <strong>Date:</strong> {job.date} <br />
                                    <strong>Time:</strong>{job.time}<br />
                                    <strong>Gender:</strong>{job.gender}<br />
                                    <strong>No of Students:</strong>{job.students}
                                </p>
                                <p className="text-lg font-semibold text-green-600 mt-2">
                                    {job.salary}
                                </p>
                            </div>
                        </div>
                        ))}
                </div>

                {/* Projects Table */}
                <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 mt-6">
                    <h2 className="text-2xl font-bold mb-4">Projects</h2>

                    <table className="w-full border-collapse border border-gray-200">
                        <thead>
                        <tr className="bg-gray-100">
                            <th className="py-3 px-4 text-left">Name</th>
                            <th className="py-3 px-4 text-left">Location</th>
                            <th className="py-3 px-4 text-left">Edit</th>
                            <th className="py-3 px-4 text-left">Rate</th>
                        </tr>
                        </thead>
                        <tbody>
                        {members.map((member) => (
                            <tr key={member.id} className="border-b border-gray-200">
                                <td className="py-3 px-4 flex items-center space-x-2">
                                    <img
                                        src="https://via.placeholder.com/40"
                                        alt={member.name}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <span>{member.name}</span>
                                </td>
                                <td className="py-3 px-4">{member.location}</td>
                                <td className="py-3 px-4">
                                    <button
                                        onClick={() => removeMember(member.id)}
                                        className="text-red-500 hover:underline"
                                    >
                                        Remove
                                    </button>
                                </td>
                                <td className="py-3 px-4 flex items-center mt-2">
                                    {[1, 2, 3, 4, 5].map((_, index) => (
                                        <Star
                                            key={index}
                                            size={16}
                                            className={index < 4 ? "text-yellow-400" : "text-gray-400"}
                                            fill="currentColor"
                                        />
                                    ))}

                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {/* Buttons */}
                    <div className="mt-6 flex space-x-4">
                        <button
                            className="bg-purple-600 text-white flex items-center px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                        >
                            <UserPlus size={18} className="mr-2" />
                            Add Member
                        </button>
                        <button
                            className="bg-blue-600 text-white flex items-center px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            <Save size={18} className="mr-2" />
                            Save
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default JobDetails;
