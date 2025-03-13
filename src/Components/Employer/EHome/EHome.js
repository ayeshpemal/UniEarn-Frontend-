import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const EHome = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const jobsPerPage = 10;

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found. Please log in.');
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.user_id;

        const response = await axios.get(
          `http://localhost:8100/api/v1/jobs/get-jobs-by-user?user_id=${userId}&page=${currentPage}`,
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

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8100/api/v1/jobs/deletejob/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  const pendingJobs = jobs.filter(job => job.jobStatus === 'PENDING');
  const ongoingJobs = jobs.filter(job => job.jobStatus === 'ON_GOING');
  const finishedJobs = jobs.filter(job => job.jobStatus === 'FINISH');
  const cancelledJobs = jobs.filter(job => job.jobStatus === 'CANCEL');

  const renderJobCard = (job) => (
    <div
      key={job.jobId}
      className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between items-start gap-4 relative"
    >
      <div className="flex-1 w-full">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{job.jobTitle || 'Job Title Not Available'}</h3>
        <p className="text-gray-600 mt-2">{job.jobDescription || 'Job description not available'}</p>
        <p className="text-gray-600 mt-2">Location: {formatLocation(job.jobLocation)}</p>
        <p className="text-gray-600 mt-2">Dates: {formatDate(job.startDate)} - {formatDate(job.endDate)}</p>
        <p className="text-gray-600 mt-2">Working Hours: {formatTime(job.startTime)} to {formatTime(job.endTime)}</p>
        <p className="text-gray-600 mt-2">Required Workers: {job.requiredWorkers || 'Not specified'}</p>
        <p className="text-gray-600 mt-2">Gender: {job.requiredGender?.length > 0 ? job.requiredGender.join(', ') : 'Not specified'}</p>
        <p className={`mt-2 ${
          job.jobStatus === 'PENDING' ? 'text-yellow-600' : 
          job.jobStatus === 'ON_GOING' ? 'text-green-600' : 
          job.jobStatus === 'FINISH' ? 'text-blue-600' : 
          'text-red-600'
        }`}>
          Status: {job.jobStatus}
        </p>
        <p className="text-green-600 font-bold mt-2">Rs. {job.jobPayment || '0.00'}</p>
        {job.jobStatus !== 'CANCEL' && (
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => handleViewStudents(job.jobId)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors w-full sm:w-auto"
            >
              View Students
            </button>
            {job.jobStatus === 'PENDING' && (
              <button
                onClick={() => handleEditJob(job.jobId)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors w-full sm:w-auto"
              >
                Edit Job
              </button>
            )}
          </div>
        )}
      </div>
      {job.jobStatus === 'PENDING' && (
        <button
          onClick={() => handleDeleteJob(job.jobId)}
          className="absolute bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Delete Job
        </button>
      )}
    </div>
  );

  const renderSection = (title, jobList) => (
    jobList.length > 0 && (
      <div className="mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobList.map(renderJobCard)}
        </div>
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="container mx-auto p-4 sm:p-6 md:p-8 lg:p-10">
        {jobs.length === 0 ? (
          <p className="text-gray-500 text-center">No jobs available.</p>
        ) : (
          <>
            {renderSection('Pending Jobs', pendingJobs)}
            {renderSection('Ongoing Jobs', ongoingJobs)}
            {renderSection('Finished Jobs', finishedJobs)}
            {renderSection('Cancelled Jobs', cancelledJobs)}
          </>
        )}

        {totalPages > 1 && jobs.length > 0 && (
          <div className="flex justify-center mt-8 gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i)}
                className={`px-4 py-2 rounded-lg ${currentPage === i ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1 || jobs.length < jobsPerPage}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default EHome;