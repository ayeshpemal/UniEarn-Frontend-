import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Activities = () => {
  const navigate = useNavigate();
  const [pendingActivities, setPendingActivities] = useState([]);
  const [confirmedActivities, setConfirmedActivities] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchActivities();
  }, [currentPage]);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const decodedToken = jwtDecode(token);
      const userId = decodedToken.user_id;

      const response = await fetch(
        `http://localhost:8100/api/v1/jobs/get-jobs-by-user?user_id=${userId}&page=${currentPage}`
      );
      const data = await response.json();

      if (data.code === 200) {
        const jobs = data.data.jobList;
        setTotalCount(data.data.dataCount);

        setPendingActivities(jobs.filter(job => job.applicationStatus === "PENDING"));
        setConfirmedActivities(jobs.filter(job => job.applicationStatus === "CONFIRMED"));
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const onNavigateToJobDetails = (jobId) => {
    navigate(`/job-details?jobId=${jobId}`);
  };

  const onNavigateToSummary = () => {
    navigate("/activities/summary");
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const renderTable = (activities, title) => (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 mt-8 transition-all duration-300 hover:shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 text-left text-sm uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Job Title</th>
              <th className="px-6 py-4 font-semibold hidden sm:table-cell">Category</th>
              <th className="px-6 py-4 font-semibold hidden md:table-cell">Description</th>
              <th className="px-6 py-4 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr
                key={activity.jobId}
                className={`border-b last:border-0 hover:bg-gray-50 transition-colors duration-200 ${
                  activities.indexOf(activity) % 2 === 0 ? "bg-white" : "bg-gray-25"
                }`}
              >
                <td
                  className="px-6 py-4 cursor-pointer text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  onClick={() => onNavigateToJobDetails(activity.jobId)}
                >
                  <div>
                    <p className="font-semibold">{activity.jobTitle}</p>
                    <p className="text-gray-600 text-sm sm:hidden">
                      {activity.jobCategory} - {activity.jobDescription}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-700 hidden sm:table-cell">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {activity.jobCategory}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700 hidden md:table-cell">
                  {activity.jobDescription}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    {new Date(activity.startDate).toLocaleDateString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPagination = () => (
    <div className="w-full max-w-6xl mx-auto mt-6 flex flex-wrap justify-center items-center gap-3 px-4">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200"
      >
        Previous
      </button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg shadow-md text-sm transition-all duration-200 ${
            currentPage === i
              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
              : "bg-white text-blue-600 hover:bg-blue-50"
          }`}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200"
      >
        Next
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section (Original size: h-[50vh] sm:h-[70vh]) */}
      <div
        className="relative h-[50vh] sm:h-[70vh] bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/30">
          <div className="max-w-7xl mx-auto h-full flex flex-col justify-center px-4 sm:px-6">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">
              My<br />
              <span className="text-blue-400 drop-shadow-lg">Activities</span>
            </h1>
            <p className="mt-2 text-white/90 text-lg sm:text-xl max-w-2xl">
              Track your job applications and opportunities
            </p>
          </div>
        </div>
      </div>

      {/* Activities Tables */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {pendingActivities.length > 0 && renderTable(pendingActivities, "Pending Activities")}
        {confirmedActivities.length > 0 && renderTable(confirmedActivities, "Confirmed Activities")}

        {/* Pagination */}
        {totalCount > itemsPerPage && renderPagination()}

        {/* Summary Button */}
        <div className="text-center mt-8">
          <button
            onClick={onNavigateToSummary}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
          >
            View Summary
          </button>
        </div>
      </div>
    </div>
  );
};

export default Activities;