import React from 'react';
import { Search, Star, ChevronDown } from 'lucide-react';
import {useNavigate} from "react-router-dom";


const jobs = [
    {
        id: 1,
        company: "K&D Garment",
        description: "නොවැම්බර් 16 සහ 17 දින පැවත්වෙන චන්දය ව්‍යාපාරය සඳහා vote activation sampling and selling...",
        reviews: "5,291 reviews",
        price: "Rs. 3500.00",
        time: "(9.00am to 6.00pm)",
        location: "116-පිළියන්දල",
        logo: "/job-logo.png",
    },

    {
        id: 2,
        company: "K&D Garment",
        description: "නොවැම්බර් 16 සහ 17 දින පැවත්වෙන චන්දය ව්‍යාපාරය සඳහා vote activation sampling and selling...",
        reviews: "5,291 reviews",
        price: "Rs. 3500.00",
        time: "(9.00am to 6.00pm)",
        location: "116-පිළියන්දල",
        logo: "/job-logo.png",
    },
];

export function Home() {
    const navigate = useNavigate();
    const onNavigateToJobDetails = () =>{
        navigate("/job-details");
    }

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

            {/* Job Listings */}
            <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 mt-6">
                <h2 className="text-2xl font-bold mb-4">Explore All Jobs</h2>

                {jobs.map((job) => (
                    <div
                        key={job.id}
                        className="flex items-center p-4 rounded-lg mb-4 shadow-md"
                    >
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold">{job.company}</h3>
                            <p className="text-gray-600">{job.description}</p>
                            <p className="text-sm text-gray-500">{job.time}</p>
                            <p className="text-sm text-gray-500">{job.location}</p>
                            <div className="flex items-center mt-2">
                                {[1, 2, 3, 4, 5].map((_, index) => (
                                    <Star
                                        key={index}
                                        size={16}
                                        className={index < 4 ? "text-yellow-400" : "text-gray-400"}
                                        fill="currentColor"
                                    />
                                ))}
                                <span className="ml-2 text-gray-500">{job.reviews}</span>
                            </div>
                            <p className="text-green-600 font-bold text-lg">{job.price}</p>
                            <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600"
                                    onClick={onNavigateToJobDetails}>
                                View Job
                            </button>
                        </div>
                        <div className="flex flex-col items-center">
                            <img src={job.logo} alt="Company Logo" className="w-20 h-20 rounded-full" />

                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}
export default Home;
