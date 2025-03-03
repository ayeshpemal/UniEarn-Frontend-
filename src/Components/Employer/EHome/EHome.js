import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // npm install jwt-decode
import axios from 'axios'; // npm install axios

const EHome = () => {
  const [jobs, setJobs] = useState([]); // Initialize as an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0); // Assuming backend returns total pages or we calculate it
  const jobsPerPage = 5; // Number of jobs per page

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found. Please log in.');
        }

        const decodedToken = jwtDecode(token);
        const userId = decodedToken.user_id;

        const response = await axios.get(
          `http://localhost:8100/api/v1/jobs/get-jobs-by-user?user_id=${userId}&page=${currentPage}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Ensure jobs is always an array
        const allJobs = Array.isArray(response.data.data) ? response.data.data : [];
        setJobs(allJobs);

        // Assuming the API returns total count or total pages; adjust based on your API response
        const totalJobs = response.data.total || allJobs.length; // Replace with actual total from API if available
        setTotalPages(Math.ceil(totalJobs / jobsPerPage));
      } catch (err) {
        setError('Failed to fetch jobs. Please try again.');
        console.error(err);
        setJobs([]); // Set jobs to an empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [currentPage]); // Re-fetch when page changes

  const handleViewStudents = (jobId) => {
    window.location.href = `/e-job-details?jobId=${jobId}`;
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `http://localhost:8100/api/v1/jobs/deletejob/${jobId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setJobs((prevJobs) => 
          Array.isArray(prevJobs) ? prevJobs.filter((job) => job.jobId !== jobId) : []
        );
        alert('Job deleted successfully');
      } catch (err) {
        console.error('Failed to delete job:', err);
        alert('Failed to delete job. Please try again.');
      }
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll to the top of the page when pagination changes
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // Smooth scrolling for a better user experience
    });
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  // Separate active and inactive jobs
  const activeJobs = jobs.filter(job => job.jobStatus === true);
  const inactiveJobs = jobs.filter(job => job.jobStatus === false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Jobs Section */}
      <section className="container mx-auto p-4 sm:p-6 md:p-8 lg:p-10" id="live-jobs-section">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">Live Jobs</h2>
        {activeJobs.length === 0 ? (
          <p className="text-gray-500 text-center">No live jobs available.</p>
        ) : (
          <div className="grid gap-6">
            {activeJobs.map((job) => (
              <div
                key={job.jobId}
                className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="flex-1 w-full sm:w-auto">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{job.jobTitle || 'Job Title Not Available'}</h3>
                  <p className="text-gray-600 mt-2">{job.jobDescription || 'Job description not available'}</p>
                  <p className="text-gray-600 mt-2">Working Hours: 9:00am to 6:00pm</p>
                  <p className="text-gray-600 mt-2">Required Workers: {job.requiredWorkers || 'Not specified'}</p>
                  <p className="text-gray-600 mt-2">Gender: {job.requiredGender.length > 0 ? job.requiredGender.join(', ') : 'Not specified'}</p>
                  <p className="text-green-600 mt-2">Status: Active</p>
                  <p className="text-green-600 font-bold mt-2">Rs. {job.jobPayment || '0.00'}</p>
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleViewStudents(job.jobId)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors w-full sm:w-auto"
                    >
                      View Students
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.jobId)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors w-full sm:w-auto"
                    >
                      Delete Job
                    </button>
                  </div>
                </div>
                <div className="ml-0 sm:ml-4 w-20 h-20 flex-shrink-0">
                  <img
                    src="/job-logo.png" // Employer logo path
                    alt={`${job.jobCategory} Logo`}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => e.target.src = '/path-to-default-logo.png'} // Fallback logo if image fails to load
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination for Live Jobs */}
        {totalPages > 1 && activeJobs.length > 0 && (
          <div className="flex justify-center mt-8 gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i)}
                className={`px-4 py-2 rounded-lg ${currentPage === i 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Recent Jobs Section */}
        {inactiveJobs.length > 0 && (
          <div className="mt-12" id="recent-jobs-section">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">Recent Jobs</h2>
            <div className="grid gap-6">
              {inactiveJobs.map((job) => (
                <div
                  key={job.jobId}
                  className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="flex-1 w-full sm:w-auto">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{job.jobTitle || 'Job Title Not Available'}</h3>
                    <p className="text-gray-600 mt-2">{job.jobDescription || 'Job description not available'}</p>
                    <p className="text-gray-600 mt-2">Working Hours: 9:00am to 6:00pm</p>
                    <p className="text-gray-600 mt-2">Required Workers: {job.requiredWorkers || 'Not specified'}</p>
                    <p className="text-gray-600 mt-2">Gender: {job.requiredGender.length > 0 ? job.requiredGender.join(', ') : 'Not specified'}</p>
                    <p className="text-red-600 mt-2">Status: Inactive</p>
                    <p className="text-green-600 font-bold mt-2">Rs. {job.jobPayment || '0.00'}</p>
                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleViewStudents(job.jobId)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors w-full sm:w-auto"
                      >
                        View Students
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.jobId)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors w-full sm:w-auto"
                      >
                        Delete Job
                      </button>
                    </div>
                  </div>
                  <div className="ml-0 sm:ml-4 w-20 h-20 flex-shrink-0">
                    <img
                      src="/job-logo.png" // Employer logo path
                      alt={`${job.jobCategory} Logo`}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => e.target.src = '/path-to-default-logo.png'} // Fallback logo if image fails to load
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default EHome;