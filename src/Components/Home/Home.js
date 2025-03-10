import React, { useEffect, useState } from 'react';
import { Search, Star } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";
import { jwtDecode } from "jwt-decode";
import axios from 'axios';

export function Home() {
  const navigate = useNavigate();
  const onNavigateToJobDetails = (jobId) => {
    window.location.href = `/job-details?jobId=${jobId}`;
  };

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchError, setSearchError] = useState(null); // For search-specific errors
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Search-related state
  const [selectedLocation, setSelectedLocation] = useState("COLOMBO"); // Default to first option
  const [selectedJob, setSelectedJob] = useState("CASHIER"); // Default to first option
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch preferred jobs on initial load
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const initialToken = localStorage.getItem('token');
        let userDetails = null;
        if (initialToken) {
          userDetails = jwtDecode(initialToken);
        }

        const userId = userDetails ? userDetails.user_id : null;
        if (!userId) {
          setError("User ID is missing or invalid.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `http://localhost:8100/api/v1/jobs/studentpreferedjobs?student_id=${userId}&page=${currentPage}`
        );
        const jobsList = response.data?.data?.jobList || [];
        setJobs(jobsList);
        setTotalPages(Math.ceil(response.data?.data?.dataCount / 10) || 1); // Assuming 10 jobs per page
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [currentPage]);

  // Search jobs function
  const searchJobs = async () => {
    setLoading(true);
    setSearchError(null); // Reset search error
    try {
      const response = await axios.get(
        `http://localhost:8100/api/v1/jobs/search?location=${selectedLocation}&categories=${selectedJob}&keyword=${searchTerm}&page=${currentPage}`,
        { headers: { "Content-Type": "application/json" } }
      );
      const searchResults = response.data?.data?.jobList || [];
      setJobs(searchResults);
      setTotalPages(Math.ceil(response.data?.data?.dataCount / 10) || 1); // Assuming 10 jobs per page
    } catch (error) {
      setSearchError(error.response?.data?.message || "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0); // Reset to first page on new search
    searchJobs();
  };

  // Fetch profile picture if not provided
  const getProfilePictureUrl = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:8100/api/user/${userId}/profile-picture`);
      return response.data?.url || "/job-logo.png"; // Adjust based on actual response structure
    } catch (error) {
      return "/job-logo.png"; // Fallback on error
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">Error: {error}</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Hero Section */}
      <header
        className="relative flex flex-col justify-center items-center text-white h-[70vh] bg-cover bg-center px-4 sm:px-6"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80")' }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white">
            Find Your Perfect <br />
            <span className="text-blue-400">Part-Time</span> Job
          </h1>
          <SearchBar
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            selectedJob={selectedJob}
            setSelectedJob={setSelectedJob}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleSearch={handleSearch}
          />
          {searchError && (
            <p className="text-red-400 mt-4 text-sm">{searchError}</p>
          )}
        </div>
      </header>

      {/* Job Listings */}
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6 mt-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Jobs For You</h2>

        {jobs.length === 0 ? (
          <p className="text-gray-500 text-center">No jobs found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <div
                key={job.jobId}
                className="flex flex-col p-4 rounded-lg shadow-md bg-gray-50"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {job.jobTitle} ({job.jobCategory})
                  </h3>
                  <p className="text-gray-600 text-sm">{job.jobDescription}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(job.startDate).toLocaleDateString()} to{" "}
                    {new Date(job.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">{job.jobLocations.join(", ")}</p>
                  <div className="flex items-center mt-2">
                    {[1, 2, 3, 4, 5].map((_, index) => (
                      <Star
                        key={index}
                        size={16}
                        className={
                          index < job.employer.rating
                            ? "text-yellow-400"
                            : "text-gray-400"
                        }
                        fill="currentColor"
                      />
                    ))}
                  </div>
                  <p className="text-green-600 font-bold text-lg mt-2">
                    {job.jobPayment} LKR
                  </p>
                  <button
                    className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 w-full sm:w-auto"
                    onClick={() => onNavigateToJobDetails(job.jobId)}
                  >
                    View Job
                  </button>
                </div>
                <div className="flex justify-center mt-4">
                  <img
                    src={
                      job.employer.profilePictureUrl
                        ? `http://localhost:8100/api/user/${job.employer.userId}/profile-picture`
                        : "/job-logo.png"
                    }
                    alt="Company Logo"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
                    onError={(e) => (e.target.src = "/job-logo.png")} // Fallback if fetch fails
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              disabled={currentPage === 0}
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
              disabled={currentPage === totalPages - 1}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;