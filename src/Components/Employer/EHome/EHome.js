import React, { useEffect, useState } from 'react';
import { Search, Star, ChevronDown } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import ESearchBar from "../ESearchBar/ESearchBar";
import { jwtDecode } from "jwt-decode";
import axios from 'axios';

export function EHome() {
    const navigate = useNavigate();
    const onNavigateToJobDetails = () => {
        navigate("/job-details");
    }

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch jobs from the API using axios
        const fetchJobs = async () => {
            try {
                console.log("before");
                const initialToken = localStorage.getItem('token');
                console.log("after");
                console.log(initialToken);
                console.log("haaaaaaaaaaaaaaaaa");
                
                let userDetails = null;
                if (initialToken) {
                    console.log("haaaaaaaaaaaaaaaaa");
                    try {
                        userDetails = jwtDecode(initialToken);  // Decoding the JWT
                        console.log("User Details:", userDetails); // Debugging
                    } catch (error) {
                        console.error("Invalid token:", error);
                    }
                }
        
                const userId = userDetails ? userDetails.user_id : null;
                console.log(userId);
        
                if (!userId) {
                    setError("User ID is missing or invalid.");
                    setLoading(false);
                    return;
                }
        
                const response = await axios.get(`http://localhost:8100/api/v1/jobs/studentpreferedjobs?student_id=${userId}&page=1`);
                console.log(response);
        
                if (response.data && response.data.length > 0) {
                    setJobs(response.data);
                } else {
                    setError("No jobs found.");
                }
        
            } catch (err) {
                console.error("Error fetching jobs:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        

        fetchJobs();
    }, []);

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    if (error) {
        return <div className="text-center text-danger">Error: {error}</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Job Listings */}
            <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 mt-6">
                <h2 className="text-2xl font-bold mb-4">Jobs For You</h2>

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
export default EHome;
