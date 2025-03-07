import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Activities = () => {
  const navigate = useNavigate();
  const [pendingActivities, setPendingActivities] = useState([]);
  const [confirmedActivities, setConfirmedActivities] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 5; // Reduced for better mobile view

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

  const onNavigateToCompany = () => {
    navigate("/company-rating");
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const renderTable = (activities, title) => (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6 mt-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-left text-xs sm:text-sm">
              <th className="px-2 py-2 sm:px-6 sm:py-3">Job Title</th>
              <th className="px-2 py-2 sm:px-6 sm:py-3 hidden sm:table-cell">Category</th>
              <th className="px-2 py-2 sm:px-6 sm:py-3 hidden md:table-cell">Description</th>
              <th className="px-2 py-2 sm:px-6 sm:py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity.jobId} className="border-t text-xs sm:text-sm">
                <td 
                  className="px-2 py-3 sm:px-6 sm:py-4 flex items-center cursor-pointer" 
                  onClick={onNavigateToCompany}
                >
                  <div>
                    <p className="font-semibold">{activity.jobTitle}</p>
                    <p className="text-gray-600 sm:hidden">
                      {activity.jobCategory} - {activity.jobDescription}
                    </p>
                  </div>
                </td>
                <td className="px-2 py-3 sm:px-6 sm:py-4 hidden sm:table-cell">
                  {activity.jobCategory}
                </td>
                <td className="px-2 py-3 sm:px-6 sm:py-4 hidden md:table-cell">
                  {activity.jobDescription}
                </td>
                <td className="px-2 py-3 sm:px-6 sm:py-4">
                  {new Date(activity.startDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPagination = () => (
    <div className="w-full max-w-6xl mx-auto mt-6 flex flex-wrap justify-center gap-2 px-4">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 text-sm"
      >
        Previous
      </button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 sm:px-4 sm:py-2 ${
            currentPage === i ? "bg-blue-700" : "bg-blue-500"
          } text-white rounded text-sm`}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 text-sm"
      >
        Next
      </button>
    </div>
  );

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Hero Section */}
      <div
        className="relative h-[50vh] sm:h-[70vh] bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50">
          <div className="max-w-7xl mx-auto h-full flex flex-col justify-center px-4 sm:px-6">
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white">
              My<br /> <span className="text-blue-400">Activities</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Activities Tables */}
      {pendingActivities.length > 0 && renderTable(pendingActivities, "Activities (Pending)")}
      {confirmedActivities.length > 0 && renderTable(confirmedActivities, "Recent Activities (Confirmed)")}

      {/* Pagination */}
      {totalCount > itemsPerPage && renderPagination()}
    </div>
  );
};

export default Activities;