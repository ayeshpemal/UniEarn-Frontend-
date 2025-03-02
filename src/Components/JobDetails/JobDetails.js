import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const JobDetails = () => {
    const { jobId } = useParams(); // Get jobId from URL
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [job, setJob] = useState(null); // Store job details

    useEffect(() => {
        // Fetch job details from the API using axios
        const fetchJob = async () => {
            try {
                console.log("Fetching job with ID:", jobId);
                const response = await axios.get(`http://localhost:8100/api/v1/jobs/getjob/${jobId}`);
                console.log("API Response:", response);

                const fetchedJob = response.data?.data || null;
                setJob(fetchedJob);
            } catch (err) {
                console.error("Error fetching job:", err);
                setError("Failed to fetch job details.");
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [jobId]); // Dependency array updated

    const navigate = useNavigate();
    const onNavigateToApplyJob = () => {
        navigate("/apply-job");
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <section className="max-w-4xl mx-auto p-6">
                <h2 className="text-2xl font-bold mb-4 text-center">Job Details</h2>

                {/* Loading & Error Handling */}
                {loading && <p className="text-center text-gray-600">Loading job details...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}
                {!loading && !error && job ? (
                    <div key={job.jobId} className="bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row-reverse relative items-start md:items-center mb-6">
                        {/* Job Logo */}
                        <div className="absolute top-6 left-6 w-20 h-20">
                            <img src="/job-logo.png" alt="Company Logo" className="rounded-full w-full h-full" />
                        </div>

                        {/* Job Details */}
                        <div className="flex-grow ml-20 bg-white p-6 rounded-lg shadow-lg">
                            {/* Job Title & Category */}
                            <h2 className="text-2xl font-bold text-gray-800">
                                {job?.jobTitle || "No job title available"}
                                <span className="text-blue-600 text-lg"> ({job?.jobCategory || "No category"})</span>
                            </h2>
                            <p className="text-gray-600 mt-2">{job?.jobDescription || "No job description available."}</p>

                            {/* Job Information */}
                            <div className="mt-4 space-y-2">
                                <p><span className="font-semibold text-gray-700">📅 Start Date:</span> {job?.startDate || "N/A"}</p>
                                <p><span className="font-semibold text-gray-700">📅 End Date:</span> {job?.endDate || "N/A"}</p>
                                <p><span className="font-semibold text-gray-700">🧑‍🤝‍🧑 Gender:</span> {job?.requiredGender || "Any"}</p>
                                <p><span className="font-semibold text-gray-700">👥 No. of Students:</span> {job?.requiredWorkers || "N/A"}</p>
                            </div>

                            {/* Locations */}
                            <div className="mt-4">
                                <span className="font-bold text-gray-700">📍 Locations:</span>
                                {job?.jobLocations?.length > 0 ? (
                                    <ul className="list-disc list-inside text-gray-600">
                                        {job.jobLocations.map((loc, index) => (
                                            <li key={index}>{loc}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500">No locations provided</p>
                                )}
                            </div>

                            {/* Rating & Salary */}
                            <p><br/>{job?.employer?.companyName || "N/A"}</p>
                            <div className="flex items-center mt-4">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((_, index) => (
                                        <Star
                                            key={index}
                                            size={20}
                                            className={index < job.employer.rating ? "text-yellow-400" : "text-gray-300"}
                                            fill="currentColor"
                                        />
                                    ))}
                                </div>
                                <span className="ml-2 text-gray-500">{job?.reviews || "No reviews"}</span>
                            </div>

                            {/* Salary */}
                            <p className="text-green-600 font-bold text-xl mt-2">
                                💰 {job?.jobPayment || "Salary not specified"}
                            </p>

                            {/* Apply Now Button */}
                            <button
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg mt-6 hover:bg-blue-700 transition duration-300"
                                onClick={onNavigateToApplyJob}
                            >
                                Apply Now 🚀
                            </button>
                        </div>

                    </div>
                ) : (
                    !loading && !error && <p className="text-center text-gray-500">No job details found.</p>
                )}
            </section>
        </div>
    );
};

export default JobDetails;
