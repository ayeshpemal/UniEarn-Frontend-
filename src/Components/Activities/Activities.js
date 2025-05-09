import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const baseUrl = window._env_.BASE_URL;
const Activities = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState({
    inactive: [],
    pending: [],
    accepted: [],
    rejected: [],
    confirmed: {
      PENDING: [],
      ON_GOING: [],
      FINISH: []
    }
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const itemsPerPage = 10;

  useEffect(() => {
    fetchActivities();
  }, [currentPage]);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const decodedToken = jwtDecode(token);
      const userId = decodedToken.user_id;

      const response = await axios.get(
        `${baseUrl}/api/v1/jobs/get-jobs-by-user?user_id=${userId}&page=${currentPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.code === 200) {
        const jobs = response.data.data.jobList;
        setTotalCount(response.data.data.dataCount);

        // Filter confirmed jobs by jobStatus
        const confirmedJobs = jobs.filter(job => job.applicationStatus === "CONFIRMED");
        
        setActivities({
          inactive: jobs.filter(job => job.applicationStatus === "INACTIVE"),
          pending: jobs.filter(job => job.applicationStatus === "PENDING"),
          accepted: jobs.filter(job => job.applicationStatus === "ACCEPTED"),
          rejected: jobs.filter(job => job.applicationStatus === "REJECTED"),
          confirmed: {
            PENDING: confirmedJobs.filter(job => job.jobStatus === "PENDING"),
            ON_GOING: confirmedJobs.filter(job => job.jobStatus === "ON_GOING"),
            FINISH: confirmedJobs.filter(job => job.jobStatus === "FINISH")
          }
        });
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setIsLoading(false);
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Inactive Activities": return "border-gray-400";
      case "Pending Activities": return "border-yellow-400";
      case "Accepted Activities": return "border-green-400";
      case "Rejected Activities": return "border-red-400";
      case "Confirmed Activities": return "border-blue-400";
      default: return "border-gray-400";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "inactive": return "bg-gray-500";
      case "pending": return "bg-yellow-500";
      case "accepted": return "bg-green-500";
      case "rejected": return "bg-red-500";
      case "confirmed": return "bg-blue-500";
      case "confirmed-pending": return "bg-blue-400";
      case "confirmed-ongoing": return "bg-blue-600";
      case "confirmed-finish": return "bg-blue-800";
      case "all": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const renderTable = (activities, title) => {
    const borderColor = getStatusColor(title);
    
    return (
      <div className={`w-full max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 mt-8 transition-all duration-300 hover:shadow-xl border-l-4 ${borderColor}`}>
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2 flex items-center">
          {title}
          <span className="ml-3 text-sm font-normal bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
            {activities.length} {activities.length === 1 ? 'item' : 'items'}
          </span>
        </h2>
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 text-left text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Job Title</th>
                <th className="px-6 py-4 font-semibold hidden sm:table-cell">Category</th>
                <th className="px-6 py-4 font-semibold hidden md:table-cell">Description</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                {(title === "Confirmed - Finished Jobs") && (
                  <th className="px-6 py-4 font-semibold">Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr
                  key={activity.jobId}
                  className={`border-b last:border-0 hover:bg-blue-50 transition-colors duration-200 ${
                    activities.indexOf(activity) % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  }`}
                >
                  <td
                    className="px-6 py-4 cursor-pointer text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    onClick={() => onNavigateToJobDetails(activity.jobId)}
                  >
                    <div>
                      <p className="font-semibold flex items-center">
                        {activity.jobTitle}
                        <svg className="w-4 h-4 ml-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                      </p>
                      <p className="text-gray-600 text-sm sm:hidden">
                        {activity.jobCategory} - {activity.jobDescription.substring(0, 50)}...
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 hidden sm:table-cell">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                      {activity.jobCategory}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 hidden md:table-cell">
                    {activity.jobDescription.length > 60 
                      ? `${activity.jobDescription.substring(0, 60)}...` 
                      : activity.jobDescription}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                      {new Date(activity.startDate).toLocaleDateString()}
                    </span>
                  </td>
                  {(title === "Confirmed - Finished Jobs") && (
                    <td className="px-6 py-4 text-gray-700">
                      {!activity.rated ? (
                        <button 
                          onClick={() => navigate(`/e-profile?userId=${activity.employer}&applicationId=${activity.applicationId}`)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-all duration-200"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                          </svg>
                          Rate Employer
                        </button>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-md text-sm flex items-center">
                          <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          Rated
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Add navigation function for rating employers
  const navigateToRateEmployer = (employerId, applicationId) => {
    navigate(`/e-profile?userId=${employerId}&applicationId=${applicationId}`);
  };

  const renderPagination = () => (
    <div className="w-full max-w-6xl mx-auto mt-8 flex flex-wrap justify-center items-center gap-3 px-4">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Previous
      </button>
      
      <div className="flex items-center overflow-x-auto gap-2 px-2 py-1 bg-white rounded-lg shadow-sm">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`min-w-[36px] h-9 rounded-lg shadow-sm text-sm transition-all duration-200 ${
              currentPage === i
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium"
                : "bg-white text-blue-600 hover:bg-blue-50"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
      >
        Next
        <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
    </div>
  );

  // Navigation tabs for filtering activities with improved hierarchy
  const renderStatusTabs = () => {
    // Main tabs
    const mainTabs = [
      { id: 'all', label: 'All Activities', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
      { id: 'inactive', label: 'Inactive', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
      { id: 'pending', label: 'Pending', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
      { id: 'accepted', label: 'Accepted', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
      { id: 'rejected', label: 'Rejected', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
      { id: 'confirmed', label: 'All Confirmed', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
    ];

    // Sub tabs for confirmed activities
    const confirmedSubTabs = [
      { id: 'confirmed-pending', label: 'Pending', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
      { id: 'confirmed-ongoing', label: 'Ongoing', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
      { id: 'confirmed-finish', label: 'Finished', icon: 'M5 13l4 4L19 7' }
    ];

    return (
      <div className="w-full max-w-6xl mx-auto mt-8 px-4 sm:px-0">
        {/* Main tabs - Improved horizontal scrolling on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-3 snap-x">
          {mainTabs.map(tab => {
            let count = 0;
            if (tab.id === 'confirmed') {
              count = Object.values(activities.confirmed).flat().length;
            } else if (tab.id !== 'all') {
              count = activities[tab.id]?.length || 0;
            }

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 snap-start flex items-center px-4 py-2 rounded-full transition-all duration-300 shadow-sm whitespace-nowrap ${
                  (activeTab === tab.id || (tab.id === 'confirmed' && activeTab.startsWith('confirmed')))
                  ? `${getStatusBgColor(tab.id)} text-white font-semibold shadow-md` 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon}></path>
                </svg>
                {tab.label}
                {tab.id !== 'all' && count > 0 && (
                  <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                    (activeTab === tab.id || (tab.id === 'confirmed' && activeTab.startsWith('confirmed'))) 
                    ? 'bg-white text-gray-800' 
                    : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Sub tabs for confirmed activities - Improved for mobile */}
        {(activeTab === 'confirmed' || activeTab.startsWith('confirmed-')) && (
          <div className="mt-2 mx-1 sm:ml-8 pb-3 relative">
            {/* Vertical line with proper spacing */}
            <div className="absolute top-1 left-3 bottom-3 w-0.5 bg-blue-200 hidden sm:block"></div>
            
            {/* Wrapper with proper padding on mobile and desktop */}
            <div className="flex flex-wrap gap-2 sm:pl-8 pl-0">
              {confirmedSubTabs.map(tab => {
                let count = 0;
                if (tab.id === 'confirmed-pending') {
                  count = activities.confirmed.PENDING.length;
                } else if (tab.id === 'confirmed-ongoing') {
                  count = activities.confirmed.ON_GOING.length;
                } else if (tab.id === 'confirmed-finish') {
                  count = activities.confirmed.FINISH.length;
                }

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-3 py-1.5 rounded-full transition-all duration-300 shadow-sm whitespace-nowrap text-sm ${
                      activeTab === tab.id
                      ? `${getStatusBgColor(tab.id)} text-white font-semibold shadow-md` 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon}></path>
                    </svg>
                    {tab.label}
                    {count > 0 && (
                      <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                        activeTab === tab.id 
                        ? 'bg-white text-gray-800' 
                        : 'bg-gray-100 text-gray-600'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Updated to handle subgroups in confirmed activities
  const getFilteredActivities = () => {
    if (activeTab === 'all') {
      const result = [
        ...(activities.inactive.length > 0 ? [{ title: "Inactive Activities", items: activities.inactive }] : []),
        ...(activities.pending.length > 0 ? [{ title: "Pending Activities", items: activities.pending }] : []),
        ...(activities.accepted.length > 0 ? [{ title: "Accepted Activities", items: activities.accepted }] : []),
        ...(activities.rejected.length > 0 ? [{ title: "Rejected Activities", items: activities.rejected }] : []),
      ];
      
      // Add confirmed subgroups
      if (activities.confirmed.PENDING.length > 0) {
        result.push({ title: "Confirmed - Pending Jobs", items: activities.confirmed.PENDING });
      }
      
      if (activities.confirmed.ON_GOING.length > 0) {
        result.push({ title: "Confirmed - Ongoing Jobs", items: activities.confirmed.ON_GOING });
      }
      
      if (activities.confirmed.FINISH.length > 0) {
        result.push({ title: "Confirmed - Finished Jobs", items: activities.confirmed.FINISH });
      }
      
      return result;
    } else if (activeTab === 'confirmed') {
      const result = [];
      
      if (activities.confirmed.PENDING.length > 0) {
        result.push({ title: "Confirmed - Pending Jobs", items: activities.confirmed.PENDING });
      }
      
      if (activities.confirmed.ON_GOING.length > 0) {
        result.push({ title: "Confirmed - Ongoing Jobs", items: activities.confirmed.ON_GOING });
      }
      
      if (activities.confirmed.FINISH.length > 0) {
        result.push({ title: "Confirmed - Finished Jobs", items: activities.confirmed.FINISH });
      }
      
      return result;
    } else {
      const statusMapping = {
        inactive: "Inactive Activities",
        pending: "Pending Activities",
        accepted: "Accepted Activities",
        rejected: "Rejected Activities",
        "confirmed-pending": "Confirmed - Pending Jobs",
        "confirmed-ongoing": "Confirmed - Ongoing Jobs",
        "confirmed-finish": "Confirmed - Finished Jobs"
      };
      
      if (activeTab === "confirmed-pending") {
        return activities.confirmed.PENDING.length > 0 ? 
          [{ title: statusMapping[activeTab], items: activities.confirmed.PENDING }] : [];
      } else if (activeTab === "confirmed-ongoing") {
        return activities.confirmed.ON_GOING.length > 0 ? 
          [{ title: statusMapping[activeTab], items: activities.confirmed.ON_GOING }] : [];
      } else if (activeTab === "confirmed-finish") {
        return activities.confirmed.FINISH.length > 0 ? 
          [{ title: statusMapping[activeTab], items: activities.confirmed.FINISH }] : [];
      } else {
        return activities[activeTab]?.length > 0 ? 
          [{ title: statusMapping[activeTab], items: activities[activeTab] }] : [];
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div
        className="relative h-[60vh] bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/40 backdrop-blur-[1px]">
          <div className="max-w-7xl mx-auto h-full flex flex-col justify-end pb-24 px-4 sm:px-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-md mt-20">
              My<br />
              <span className="text-blue-400 drop-shadow-lg">Activities</span>
            </h1>
            <p className="mt-3 text-white/90 text-lg sm:text-xl max-w-2xl drop-shadow-sm">
              Track your job applications and opportunities
            </p>
            <div className="mt-6">
              <button
                onClick={onNavigateToSummary}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center group"
              >
                <span>View Summary</span>
                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {renderStatusTabs()}

      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 relative -mt-4 z-10">
        {isLoading ? (
          <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-12 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-gray-200 animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading activities...</p>
          </div>
        ) : totalCount === 0 ? (
          <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-900">No activities found</h3>
            <p className="mt-2 text-gray-500">You don't have any job activities yet.</p>
          </div>
        ) : (
          <>
            {getFilteredActivities().map(({ title, items }) => renderTable(items, title))}
            {totalCount > itemsPerPage && renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default Activities;