import React, { useEffect, useState } from 'react';
import { Search, Star } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";
import { jwtDecode } from "jwt-decode";
import axios from 'axios';

const baseUrl = window._env_.BASE_URL;
export function Home() {
  const navigate = useNavigate();
  const onNavigateToJobDetails = (jobId) => {
    window.location.href = `/job-details?jobId=${jobId}`;
  };

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [isSearchResult, setIsSearchResult] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState("COLOMBO");
  const [selectedJob, setSelectedJob] = useState("CASHIER");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

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
          `${baseUrl}/api/v1/jobs/studentpreferedjobs?student_id=${userId}&page=${currentPage}`,
          { headers: { Authorization: `Bearer ${initialToken}` } }
        );
        const jobsList = response.data?.data?.jobList || [];
        setJobs(jobsList);
        setTotalJobs(response.data?.data?.dataCount || 0);
        setTotalPages(Math.ceil(response.data?.data?.dataCount / 10) || 1);
        setIsSearchResult(false);

      } catch (err) {
        setError(err.message);
        console.error("Fetch jobs error:", err);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch recommended jobs if not in search mode
    if (!isSearchResult) {
      fetchJobs();
    }
  }, [currentPage, isSearchResult]);

  // Add this useEffect to handle pagination during search
  useEffect(() => {
    // If we're in search mode and the page changes, we need to refresh the search results
    if (isSearchResult && !loading) {
      searchJobs();
    }
  }, [currentPage]);

  const searchJobs = async () => {
    setLoading(true);
    setSearchError(null);
    
    // Scroll to job listings section for better user experience
    const jobsSection = document.querySelector('#jobs-section');
    if (jobsSection) {
      jobsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${baseUrl}/api/v1/jobs/search?location=${selectedLocation}&categories=${selectedJob}&keyword=${searchTerm}${selectedDate ? `&startDate=${selectedDate}` : ''}&page=${currentPage}`,
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );
      const searchResults = response.data?.data?.jobList || [];
      setJobs(searchResults);
      setTotalJobs(response.data?.data?.dataCount || 0);
      setTotalPages(Math.ceil(response.data?.data?.dataCount / 10) || 1);
      setIsSearchResult(true);

    } catch (error) {
      setSearchError(error.response?.data?.message || "Search failed. Please try again.");
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    searchJobs();
  };

  const handleJobCategoryChange = (selectedCategories) => {
    // Convert array to comma-separated string for API
    setSelectedJob(Array.isArray(selectedCategories) ? selectedCategories.join(',') : selectedCategories);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearSearch = () => {
    setIsSearchResult(false);
    setCurrentPage(0);
  };

  // Format time from 24-hour format to 12-hour format
  const formatTime = (timeString) => {
    if (!timeString) return 'Not specified';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-8 max-w-md mx-auto mt-10 bg-red-50 rounded-xl shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="font-medium">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero section - preserved as is */}
      <header
        className="relative h-[60vh] bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/40 backdrop-blur-[1px]">
          <div className="max-w-7xl mx-auto h-full flex flex-col justify-end pb-24 px-4 sm:px-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-md mt-20">
              Find Your Perfect <br />
              <span className="text-blue-400 drop-shadow-lg">Part-Time</span> Job
            </h1>
            <SearchBar
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              selectedJob={selectedJob}
              setSelectedJob={handleJobCategoryChange}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              handleSearch={handleSearch}
            />
            {searchError && (
              <p className="text-red-400 mt-4 text-sm">{searchError}</p>
            )}
          </div>
        </div>
      </header>

      {/* Updated job listing section with dynamic heading */}
      <section className="container mx-auto p-4 sm:p-6 md:p-8 lg:p-10" id="jobs-section">
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                {isSearchResult ? 'Search Results' : 'Jobs For You'}
              </h2>
              <p className="text-gray-600 mt-1">
                {totalJobs} {totalJobs === 1 ? 'job' : 'jobs'} found
              </p>
            </div>
            
            {isSearchResult && (
              <button
                onClick={clearSearch}
                className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Recommended Jobs
              </button>
            )}
          </div>

          {jobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-10 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 text-lg">No jobs found.</p>
              {isSearchResult && (
                <button 
                  onClick={clearSearch}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Back to Recommended Jobs
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div
                  key={job.jobId}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full border border-gray-100"
                >
                  {/* Card header with job title */}
                  <div className="p-5 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                      {job.jobTitle}
                    </h3>
                  </div>

                  {/* Card body with job details */}
                  <div className="p-5 flex-1">
                    <div className="mb-3">
                      <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-sm font-medium">
                        {job.jobCategory}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-gray-600">{job.jobLocations.join(", ")}</p>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-600">
                          {new Date(job.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} to{" "}
                          {new Date(job.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>

                      <div className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-600">{formatTime(job.startTime)} to {formatTime(job.endTime)}</p>
                      </div>

                      <div className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <p className="text-gray-600">Gender: {job.requiredGender && job.requiredGender.length > 0 ? job.requiredGender.join(", ") : "Any"}</p>
                      </div>
                      
                      {/* Employer rating */}
                      <div className="flex items-center mt-1">
                        <span className="text-gray-600 mr-2">Rating:</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((_, index) => (
                            <Star
                              key={index}
                              size={16}
                              className={
                                index < job.employer.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }
                              fill="currentColor"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-green-600 font-bold text-xl">Rs. {job.jobPayment}</p>
                    </div>
                  </div>

                  {/* Card footer with action button */}
                  <div className="p-5 pt-2 border-t border-gray-100 bg-gray-50">
                    <button
                      className="w-full bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                      onClick={() => onNavigateToJobDetails(job.jobId)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Job
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center mt-8 gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                    currentPage === i 
                      ? 'bg-blue-500 text-white font-medium' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 flex items-center"
              >
                Next
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;