import React, { useEffect, useState } from 'react';
import { Search, Star, ChevronDown } from 'lucide-react';
import { useNavigate, useParams } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";
import { jwtDecode } from "jwt-decode";
import axios from 'axios';

export function SearchResults() {
    const navigate = useNavigate();
    const { selectedLocation, selectedJob, searchTerm } = useParams();
    const dselectedLocation = decodeURIComponent(selectedLocation);
    const dselectedJob = decodeURIComponent(selectedJob);
    const dsearchTerm = decodeURIComponent(searchTerm);

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const onNavigateToJobDetails = (jobId) => {
        if (!jobId) {
            console.error("Job ID is undefined");
            return;
        }
        navigate(`/job-details/${jobId}`);
    };

    useEffect(() => {
        // Fetch jobs from the API using axios
        const fetchJobs = async () => {
            try {

                const response = await axios.get(`http://localhost:8100/api/v1/jobs/search?location=${dselectedLocation}&categories=${dselectedJob}&keyword=${dsearchTerm}&page=0`);
                console.log(response);
                const jobs = response.data?.data?.jobList || [];
                setJobs(jobs);
        
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
                <h2 className="text-2xl font-bold mb-4">Job Results For You</h2>

                {jobs.map((job) => (
                    <div
                        key={job.jobId}
                        className="flex items-center p-4 rounded-lg mb-4 shadow-md"
                    >
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold">{job.jobTitle}({job.jobCategory})</h3>
                            <p className="text-gray-600">{job.jobDescription}</p>
                            <p className="text-sm text-gray-500"> 
                                {new Date(job.startDate).toLocaleDateString()} to {new Date(job.endDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">{job.jobLocations}</p>
                            <div className="flex items-center mt-2">
                                {[1, 2, 3, 4, 5].map((_, index) => (
                                    <Star
                                        key={index}
                                        size={16}
                                        className={index < job.employer.rating ? "text-yellow-400" : "text-gray-400"}
                                        fill="currentColor"
                                    />
                                ))}
                                <span className="ml-2 text-gray-500">{job.reviews}</span>
                            </div>
                            <p className="text-green-600 font-bold text-lg">{job.price}</p>
                            <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600"
                                onClick={() => onNavigateToJobDetails(job.jobId)}>
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
export default SearchResults;