import React, { useState, useEffect } from "react";
import axios from "axios";
import ReportDetailsPopup from "./ReportDetailsPopup";
import { jwtDecode } from "jwt-decode";
import { useParams, useLocation } from "react-router-dom"; // Add these imports
import DeleteUserConfirmationPopup from "./DeleteUserConfirmationPopup";

const AReport = () => {
  // Access URL parameters
  const { userId: urlUserId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryUserId = queryParams.get('userId');
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Popup state
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filter states - initialize with URL param if available
  const [userId, setUserId] = useState(urlUserId || queryUserId || "");
  const [filterByUser, setFilterByUser] = useState(Boolean(urlUserId || queryUserId));
  
  // Active tab for filtering by status
  const [activeTab, setActiveTab] = useState('ALL');

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Get authentication token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return { 'Authorization': `Bearer ${token}` };
  };

  // Fetch all reports
  const fetchAllReports = async (page = currentPage, size = pageSize) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://localhost:8100/api/v1/report/getall?page=${page}&size=${size}`,
        { headers: getAuthHeaders() }
      );
      
      if (response.data.code === 200) {
        setReports(response.data.data.reportDTOList || []);
        setTotalItems(response.data.data.totalItems || 0);
      } else {
        setError(`Error ${response.data.code}: ${response.data.message || "Failed to fetch reports"}`);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(err.response?.data?.message || "Network error when connecting to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch reports by user ID
  const fetchReportsByUserId = async (userId, page = currentPage, size = pageSize) => {
    if (!userId.trim()) {
      setError("Please enter a valid user ID");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://localhost:8100/api/v1/report/getall-by-id?userId=${userId}&page=${page}&size=${size}`,
        { headers: getAuthHeaders() }
      );
      
      if (response.data.code === 200) {
        setReports(response.data.data.reportDTOList || []);
        setTotalItems(response.data.data.totalItems || 0);
      } else {
        setError(`Error ${response.data.code}: ${response.data.message || "Failed to fetch reports for this user"}`);
      }
    } catch (err) {
      console.error("Error fetching reports by user ID:", err);
      setError(err.response?.data?.message || "Network error when connecting to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Update report status (resolve or reject)
  const updateReportStatus = async (reportId, reportStatus) => {
    setActionLoading(reportId);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await axios.put(
        `http://localhost:8100/api/v1/report/resolve?reportId=${reportId}&status=${reportStatus}`,
        {}, // Empty body for PUT request
        { headers: getAuthHeaders() }
      );
      
      if (response.data.code === 200) {
        // Update the local reports array to reflect the status change
        setReports(reports.map(report => 
          report.reportId === reportId 
            ? { ...report, status: reportStatus } 
            : report
        ));
        
        // If a report is currently selected in the popup, update it too
        if (selectedReport && selectedReport.reportId === reportId) {
          setSelectedReport({ ...selectedReport, status: reportStatus });
        }
        
        setSuccessMessage(`Report #${reportId} has been ${reportStatus === "RESOLVED" ? "resolved" : "rejected"} successfully.`);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
        
        // Close the popup after successful action
        setSelectedReport(null);
      } else {
        setError(`Error ${response.data.code}: ${response.data.message || `Failed to ${reportStatus.toLowerCase()} report #${reportId}`}`);
      }
    } catch (err) {
      console.error(`Error updating report status:`, err);
      setError(err.response?.data?.message || "Network error when updating report. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // Replace the existing deleteUser function with this:
  const deleteUser = async (userId) => {
    setActionLoading('delete-user');
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await axios.delete(
        `http://localhost:8100/api/user/users/${userId}/delete`,
        { headers: getAuthHeaders() }
      );
      
      if (response.status === 200 || response.status === 204) {
        setSuccessMessage(`User ${userId} has been successfully deleted.`);
        
        // Clear the filter after successful deletion
        clearFilter();
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } else {
        setError(`Failed to delete user ${userId}. Please try again.`);
      }
    } catch (err) {
      console.error(`Error deleting user:`, err);
      setError(err.response?.data?.message || "Network error when deleting user. Please try again.");
    } finally {
      setActionLoading(null);
      setShowDeleteConfirmation(false);
      setUserToDelete(null);
    }
  };

  // Handle resolving a report
  const handleResolve = (reportId) => {
    updateReportStatus(reportId, "RESOLVED");
  };

  // Handle rejecting a report
  const handleReject = (reportId) => {
    updateReportStatus(reportId, "REJECTED");
  };

  // Handle opening the report details popup
  const handleViewReport = (report) => {
    setSelectedReport(report);
  };

  // Handle closing the report details popup
  const handleClosePopup = () => {
    setSelectedReport(null);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle form submission for user ID filter
  const handleSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(0); // Reset to first page
    setFilterByUser(true);
    fetchReportsByUserId(userId, 0, pageSize);
  };

  // Clear filter and show all reports
  const clearFilter = () => {
    setUserId("");
    setFilterByUser(false);
    setCurrentPage(0);
    fetchAllReports(0, pageSize);
  };

  // Add this function to handle the delete button click
  const handleDeleteClick = (userId) => {
    setUserToDelete(userId);
    setShowDeleteConfirmation(true);
  };

  // Add this function to handle cancel
  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setUserToDelete(null);
  };

  // Initial data fetch - modified to check for URL parameters
  useEffect(() => {
    if (urlUserId || queryUserId) {
      // If userId is in URL, apply filter automatically
      setFilterByUser(true);
      setUserId(urlUserId || queryUserId);
      fetchReportsByUserId(urlUserId || queryUserId, 0, pageSize);
    } else if (filterByUser && userId) {
      fetchReportsByUserId(userId, currentPage, pageSize);
    } else {
      fetchAllReports(currentPage, pageSize);
    }
  }, [currentPage, pageSize, urlUserId, queryUserId]);

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / pageSize);

  // Get filtered reports based on active tab
  const getFilteredReports = () => {
    if (activeTab === 'ALL') return reports;
    return reports.filter(report => report.status === activeTab);
  };

  // Count reports by status
  const pendingReports = reports.filter(report => report.status === 'PENDING').length;
  const resolvedReports = reports.filter(report => report.status === 'RESOLVED').length;
  const rejectedReports = reports.filter(report => report.status === 'REJECTED').length;

  // Tab navigation component
  const TabButton = ({ status, label, count }) => {
    // Define icons for each status
    const getStatusIcon = (status) => {
      switch(status) {
        case 'ALL': return 'M4 6h16M4 10h16M4 14h16M4 18h16';
        case 'PENDING': return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
        case 'RESOLVED': return 'M5 13l4 4L19 7';
        case 'REJECTED': return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
        default: return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
      }
    };

    // Define color schemes for each status
    const getStatusBgColor = (status) => {
      switch(status) {
        case 'ALL': return activeTab === status ? 'bg-blue-500' : 'bg-white text-blue-700 hover:bg-blue-50';
        case 'PENDING': return activeTab === status ? 'bg-yellow-500' : 'bg-white text-yellow-700 hover:bg-yellow-50';
        case 'RESOLVED': return activeTab === status ? 'bg-green-500' : 'bg-white text-green-700 hover:bg-green-50';
        case 'REJECTED': return activeTab === status ? 'bg-red-500' : 'bg-white text-red-700 hover:bg-red-50';
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

  // Status badge component
  const StatusBadge = ({ status }) => {
    const badgeStyles = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'RESOLVED': 'bg-green-100 text-green-800 border-green-200',
      'REJECTED': 'bg-red-100 text-red-800 border-red-200'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${badgeStyles[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Report Details Popup */}
      {selectedReport && (
        <ReportDetailsPopup
          report={selectedReport}
          onClose={handleClosePopup}
          onResolve={handleResolve}
          onReject={handleReject}
          actionLoading={actionLoading}
          formatDate={formatDate}
        />
      )}

      {/* Delete User Confirmation Popup */}
      {showDeleteConfirmation && (
        <DeleteUserConfirmationPopup
          userId={userToDelete}
          onConfirm={() => deleteUser(userToDelete)}
          onCancel={handleCancelDelete}
          isLoading={actionLoading === 'delete-user'}
        />
      )}

      {/* Hero Section */}
      <div
        className="relative h-[30vh] sm:h-[40vh] md:h-[50vh] bg-cover bg-center bg-fixed"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1590402494587-44b71d7772f6?auto=format&fit=crop&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/60 backdrop-blur-[1px]">
          <div className="max-w-7xl mx-auto h-full flex flex-col justify-center px-4 sm:px-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight drop-shadow-md animate-fade-in-down">
              Report<br />
              <span className="text-red-400 drop-shadow-lg">Management</span>
            </h1>
            <p className="mt-2 sm:mt-3 text-white/90 text-base sm:text-lg md:text-xl max-w-2xl drop-shadow-sm animate-fade-in-up">
              Effectively manage and review user reports across the platform
            </p>
          </div>
        </div>
      </div>

      {/* Main content section */}
      <div className="container mx-auto py-8 px-4 sm:px-6 -mt-16 relative z-10">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 animate-fade-in-up">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Report Dashboard</h2>
          
          {/* Tab navigation */}
          <div className="flex flex-nowrap gap-2 mb-6 bg-gray-100 p-2 rounded-lg overflow-x-auto snap-x scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <TabButton status="ALL" label="All Reports" count={reports.length} />
            <TabButton status="PENDING" label="Pending" count={pendingReports} />
            <TabButton status="RESOLVED" label="Resolved" count={resolvedReports} />
            <TabButton status="REJECTED" label="Rejected" count={rejectedReports} />
          </div>
          
          {/* Filter form */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-700">Filter Reports</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div className="col-span-1 sm:col-span-1 lg:col-span-2">
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="Enter user ID to filter"
                />
              </div>
              
              <div className="col-span-1">
                <label htmlFor="pageSize" className="block text-sm font-medium text-gray-700 mb-1">
                  Items per page
                </label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(0);
                  }}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
              
              <div className="col-span-1 flex gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-grow"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </button>
                {filterByUser && (
                  <button
                    type="button"
                    onClick={clearFilter}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm animate-fade-in" role="alert">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700 font-medium">Error</span>
              </div>
              <p className="mt-1 ml-7 text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md shadow-sm animate-fade-in" role="alert">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-700 font-medium">Success</span>
              </div>
              <p className="mt-1 ml-7 text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {/* Filter active indicator */}
          {filterByUser && (
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-2 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Currently filtering reports for User ID: <strong>{userId}</strong></span>
            </div>
          )}

          {/* Delete user button - shows only when filtering by a specific user and reports exist */}
          {filterByUser && getFilteredReports().length > 0 && (
            <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center bg-red-50 p-3 rounded-lg border border-red-100">
              <div className="flex items-center gap-2 text-sm text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Reports found for User ID: <strong>{getFilteredReports()[0]?.reportedUser}</strong></span>
              </div>
              <button
                onClick={() => handleDeleteClick(getFilteredReports()[0]?.reportedUser)}
                disabled={actionLoading === 'delete-user'}
                className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150"
              >
                {actionLoading === 'delete-user' ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Deleting...
                  </div>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Reported User
                  </>
                )}
              </button>
            </div>
          )}

          {/* Reports display */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : getFilteredReports().length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              {/* Mobile Card View (Small Screens) */}
              <div className="block lg:hidden">
                {getFilteredReports().map((report) => (
                  <div key={report.reportId} className="border-b border-gray-200 p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <span className="font-medium text-gray-900">Report #{report.reportId}</span>
                        <div className="mt-1">
                          <StatusBadge status={report.status} />
                        </div>
                      </div>
                      <button 
                        onClick={() => handleViewReport(report)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors duration-150 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Details
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                      <div>
                        <span className="font-medium text-gray-700">Reporter:</span> {report.reporter}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Reported:</span> {report.reportedUser}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium text-gray-700">Date:</span> {formatDate(report.reportDate)}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium text-gray-700">Feedback:</span>
                        <p className="mt-1 line-clamp-2">{report.feedback}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Table View (Large Screens) */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Report ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reporter ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reported User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Feedback
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Report Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Existing table row code remains the same */}
                    {getFilteredReports().map((report) => (
                      <tr key={report.reportId} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {report.reportId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {report.reporter}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {report.reportedUser}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {report.feedback}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(report.reportDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={report.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => handleViewReport(report)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors duration-150 flex items-center float-right"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 text-center rounded-lg shadow-sm border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 text-lg">No reports found matching the current filters.</p>
              {filterByUser && (
                <button 
                  onClick={clearFilter}
                  className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Clear Filter
                </button>
              )}
            </div>
          )}

          {/* Pagination controls */}
          {totalPages > 1 && reports.length > 0 && (
            <div className="flex flex-wrap justify-center mt-6 gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 flex items-center transition-colors duration-150"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Previous</span>
              </button>
              
              {/* Mobile Pagination Indicator */}
              <div className="flex items-center px-3 py-2 bg-gray-100 rounded-lg text-gray-700 sm:hidden">
                Page {currentPage + 1} of {totalPages}
              </div>
              
              {/* Desktop Page Numbers */}
              <div className="hidden sm:flex flex-wrap gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors duration-150 ${
                      currentPage === i 
                        ? 'bg-blue-500 text-white font-medium' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 flex items-center transition-colors duration-150"
              >
                <span className="hidden sm:inline">Next</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AReport;