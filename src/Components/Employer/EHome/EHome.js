import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const baseUrl = window._env_.BASE_URL;
const EHome = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const jobsPerPage = 10;
  const [activeTab, setActiveTab] = useState('PENDING'); // New state for tab navigation

  // Add this effect to scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found. Please log in.');
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.user_id;

        const response = await axios.get(
          `${baseUrl}/api/v1/jobs/get-jobs-by-user?user_id=${userId}&page=${currentPage}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const allJobs = Array.isArray(response.data.data.jobList) ? response.data.data.jobList : [];
        setJobs(allJobs);
        const totalJobs = response.data.data.dataCount || allJobs.length;
        setTotalPages(Math.ceil(totalJobs / jobsPerPage));
      } catch (err) {
        setError('Failed to fetch jobs. Please try again.');
        console.error(err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [currentPage]);

  const handleViewStudents = (jobId) => {
    window.location.href = `/e-job-details?jobId=${jobId}`;
  };

  const handleEditJob = (jobId) => {
    window.location.href = `/e-job-edit?jobId=${jobId}`;
  };

  const handleCancelJob = async (jobId) => {
    if (window.confirm('Are you sure you want to cancel this job?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.put(
          `${baseUrl}/api/v1/jobs/set-status?job_id=${jobId}&status=CANCEL`, 
          {}, // Empty body for PUT request
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Update the job status locally
        setJobs((prevJobs) => 
          Array.isArray(prevJobs) 
            ? prevJobs.map(job => job.jobId === jobId ? {...job, jobStatus: 'CANCEL'} : job)
            : []
        );
        alert('Job cancelled successfully');
      } catch (err) {
        if(err.status === 400){
          alert(err.response.data.message);
          return;
        }
        console.error('Failed to cancel job:', err);
        alert('Failed to cancel job. Please try again.');
      }
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const formatLocation = (locationString) => {
    if (!locationString) return 'Not specified';
    try {
      return locationString.replace(/[\[\]]/g, '');
    } catch (error) {
      return locationString;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (error) {
      return dateString;
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-red-500 text-center p-8 max-w-md mx-auto mt-10 bg-red-50 rounded-xl shadow-md">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="font-medium">{error}</p>
    </div>
  );

  const pendingJobs = jobs.filter(job => job.jobStatus === 'PENDING');
  const ongoingJobs = jobs.filter(job => job.jobStatus === 'ON_GOING');
  const finishedJobs = jobs.filter(job => job.jobStatus === 'FINISH');
  const cancelledJobs = jobs.filter(job => job.jobStatus === 'CANCEL');

  // Status badge component for cleaner display
  const StatusBadge = ({ status }) => {
    const badgeStyles = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'ON_GOING': 'bg-green-100 text-green-800 border-green-200',
      'FINISH': 'bg-blue-100 text-blue-800 border-blue-200',
      'CANCEL': 'bg-red-100 text-red-800 border-red-200'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${badgeStyles[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {status}
      </span>
    );
  };

  const renderJobCard = (job) => (
    <div
      key={job.jobId}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full border border-gray-100"
    >
      {/* Card header with job title and status */}
      <div className="p-5 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{job.jobTitle || 'Job Title Not Available'}</h3>
        <StatusBadge status={job.jobStatus} />
      </div>

      {/* Card body with job details */}
      <div className="p-5 flex-1">
        <p className="text-gray-700 mb-4 line-clamp-2">{job.jobDescription || 'Job description not available'}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-600">{formatLocation(job.jobLocation)}</p>
          </div>
          
          <div className="flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-600">{formatDate(job.startDate)} - {formatDate(job.endDate)}</p>
          </div>
          
          <div className="flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600">{formatTime(job.startTime)} to {formatTime(job.endTime)}</p>
          </div>
          
          <div className="flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-600">Required: {job.requiredWorkers || 'Not specified'}</p>
          </div>
          
          <div className="flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-gray-600">Gender: {job.requiredGender?.length > 0 ? job.requiredGender.join(', ') : 'Not specified'}</p>
          </div>
        </div>
        
        <div className="mt-5">
          <p className="text-green-600 font-bold text-xl">Rs. {job.jobPayment || '0.00'}</p>
        </div>
      </div>

      {/* Card footer with action buttons */}
      <div className="p-5 pt-2 border-t border-gray-100 bg-gray-50">
        {job.jobStatus !== 'CANCEL' && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleViewStudents(job.jobId)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex-grow sm:flex-grow-0 text-sm md:text-base flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Students
            </button>
            
            {job.jobStatus === 'PENDING' && (
              <>
                <button
                  onClick={() => handleEditJob(job.jobId)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex-grow sm:flex-grow-0 text-sm md:text-base flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Job
                </button>

                <button
                  onClick={() => handleCancelJob(job.jobId)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex-grow sm:flex-grow-0 text-sm md:text-base flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // New tabbed navigation system with improved styling matching Activities.js
  const TabButton = ({ status, label, count }) => {
    // Define icons for each status
    const getStatusIcon = (status) => {
      switch(status) {
        case 'PENDING': return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
        case 'ON_GOING': return 'M13 10V3L4 14h7v7l9-11h-7z';
        case 'FINISH': return 'M5 13l4 4L19 7';
        case 'CANCEL': return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
        default: return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
      }
    };

    // Define color schemes for each status
    const getStatusBgColor = (status) => {
      switch(status) {
        case 'PENDING': return activeTab === status ? 'bg-yellow-500' : 'bg-white text-yellow-700 hover:bg-yellow-50';
        case 'ON_GOING': return activeTab === status ? 'bg-green-500' : 'bg-white text-green-700 hover:bg-green-50';
        case 'FINISH': return activeTab === status ? 'bg-blue-500' : 'bg-white text-blue-700 hover:bg-blue-50';
        case 'CANCEL': return activeTab === status ? 'bg-red-500' : 'bg-white text-red-700 hover:bg-red-50';
        default: return activeTab === status ? 'bg-gray-500' : 'bg-white text-gray-700 hover:bg-gray-100';
      }
    };

    return (
      <button
        onClick={() => setActiveTab(status)}
        className={`flex-shrink-0 snap-start flex items-center px-4 py-2 rounded-full transition-all duration-300 shadow-sm whitespace-nowrap ${
          activeTab === status 
            ? `${getStatusBgColor(status)} text-white font-semibold shadow-md` 
            : getStatusBgColor(status)
        }`}
      >
        <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={getStatusIcon(status)}></path>
        </svg>
        {label}
        <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${
          activeTab === status 
          ? 'bg-white text-gray-800' 
          : 'bg-gray-100 text-gray-600'
        }`}>
          {count}
        </span>
      </button>
    );
  };

  // Function to get active jobs based on tab
  const getActiveJobs = () => {
    switch (activeTab) {
      case 'PENDING': return pendingJobs;
      case 'ON_GOING': return ongoingJobs;
      case 'FINISH': return finishedJobs;
      case 'CANCEL': return cancelledJobs;
      default: return jobs;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="container mx-auto p-4 sm:p-6 md:p-8 lg:p-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">My Jobs</h1>
          
          {/* Tab navigation */}
          <div className="flex flex-wrap gap-2 mb-6 bg-gray-100 p-2 rounded-lg overflow-x-auto">
            <TabButton status="PENDING" label="Pending" count={pendingJobs.length} />
            <TabButton status="ON_GOING" label="Ongoing" count={ongoingJobs.length} />
            <TabButton status="FINISH" label="Finished" count={finishedJobs.length} />
            <TabButton status="CANCEL" label="Cancelled" count={cancelledJobs.length} />
          </div>
          
          {jobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-10 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 text-lg">No jobs available.</p>
              <button 
                onClick={() => window.location.href = '/e-job-create'} 
                className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create a New Job
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getActiveJobs().map(renderJobCard)}
              </div>

              {getActiveJobs().length === 0 && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-500">No {activeTab.toLowerCase().replace('_', ' ')} jobs available.</p>
                </div>
              )}
            </>
          )}

          {totalPages > 1 && jobs.length > 0 && (
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
                disabled={currentPage === totalPages - 1 || jobs.length < jobsPerPage}
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
};

export default EHome;