import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import SubmitNotiBox from '../../../Components/SubmitNotiBox/SubmitNotiBox';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const ManageAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [employersPerPage] = useState(10);
  const [isSearching, setIsSearching] = useState(false);
  const baseUrl = window._env_.BASE_URL;
  const navigate = useNavigate();
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [notification, setNotification] = useState({ message: '', status: '', show: false });

  useEffect(() => {
    // Get current user ID from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setCurrentUserId(decodedToken.user_id);
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    }
    
    fetchAdmins();
    fetchEmployers(0); // API uses 0-based indexing for pages
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${baseUrl}/api/admin/all-admins`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log("Admins response:", response.data);
      
      if (response.data && response.data.data) {
        setAdmins(response.data.data);
      } else {
        setAdmins([]);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching admins:', err);
      setError('Failed to fetch admins. Please try again.');
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployers = async (page) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Adjusted URL to use 0-based page index
      const response = await axios.get(`${baseUrl}/api/employers?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log("Employers response:", response.data);
      
      if (response.data && response.data.data && response.data.data.users) {
        setEmployers(response.data.data.users);
        const totalEmployers = response.data.data.totalUsers;
        setTotalPages(Math.ceil(totalEmployers / employersPerPage));
        setCurrentPage(page + 1); // For UI, we display as 1-based
      } else {
        setEmployers([]);
        setTotalPages(1);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching employers:', err);
      setError('Failed to fetch employers. Please try again.');
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const searchEmployers = async (query, page) => {
    if (!query.trim()) {
      setError('Please enter a search term');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Adjusted URL to use 0-based page index
      const response = await axios.get(`${baseUrl}/api/employers/search?query=${query}&page=${page - 1}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log("Search response:", response.data);
      
      if (response.data && response.data.data && response.data.data.employers) {
        setEmployers(response.data.data.employers);
        const totalEmployers = response.data.data.totalEmployers;
        setTotalPages(Math.ceil(totalEmployers / employersPerPage));
        setCurrentPage(page);
        setIsSearching(true);
      } else {
        setEmployers([]);
        setTotalPages(1);
      }
      setError('');
    } catch (err) {
      console.error('Error searching employers:', err);
      setError('Failed to search employers. Please try again.');
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    searchEmployers(searchTerm, 1);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
    fetchEmployers(0); // Reset to first page, using 0-based index
  };

  const handlePageChange = (page) => {
    if (isSearching) {
      searchEmployers(searchTerm, page);
    } else {
      fetchEmployers(page - 1); // Convert UI page (1-based) to API page (0-based)
    }
  };
  
  // Open confirmation modal for making an admin
  const confirmMakeAdmin = (userId, userName) => {
    setModalTitle('Make Admin');
    setModalMessage(`Are you sure you want to make ${userName} (ID: ${userId}) an administrator?`);
    setSelectedUserId(userId);
    setModalAction('makeAdmin');
    setModalOpen(true);
  };
  
  // Open confirmation modal for removing an admin
  const confirmRemoveAdmin = (userId, userName) => {
    setModalTitle('Remove Admin');
    setModalMessage(`Are you sure you want to remove administrator privileges from ${userName} (ID: ${userId})?`);
    setSelectedUserId(userId);
    setModalAction('removeAdmin');
    setModalOpen(true);
  };
  
  // Handle confirmation modal action
  const handleConfirmAction = async () => {
    if (modalAction === 'makeAdmin') {
      await makeAdmin(selectedUserId);
    } else if (modalAction === 'removeAdmin') {
      await removeAdmin(selectedUserId);
    }
    setModalOpen(false);
  };
  
  // Close modal without action
  const handleCancelAction = () => {
    setModalOpen(false);
    setSelectedUserId(null);
  };

  const makeAdmin = async (selectedUserId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.post(`${baseUrl}/api/admin/make-admin/${selectedUserId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setMessage(`User ${selectedUserId} is now an admin`);
      setNotification({
        message: `User ${selectedUserId} is now an admin`,
        status: 'success',
        show: true
      });
      setUserId('');
      setError('');
      
      // Refresh both the admin list and employer list
      fetchAdmins();
      
      // Refresh employer list while preserving search state
      if (isSearching) {
        searchEmployers(searchTerm, currentPage);
      } else {
        fetchEmployers(currentPage - 1); // Convert UI's 1-based to API's 0-based
      }
      
    } catch (err) {
      console.error('Error making admin:', err);
      setError(err.response?.data?.message || 'Failed to make user an admin');
      setNotification({
        message: err.response?.data?.message || 'Failed to make user an admin',
        status: 'error',
        show: true
      });
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const removeAdmin = async (adminId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.post(`${baseUrl}/api/admin/remove-admin/${adminId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setMessage(`Admin privileges removed for user ${adminId}`);
      setNotification({
        message: `Admin privileges removed for user ${adminId}`,
        status: 'success',
        show: true
      });
      setError('');
      fetchAdmins();
    } catch (err) {
      console.error('Error removing admin:', err);
      setError(err.response?.data?.message || 'Failed to remove admin privileges');
      setNotification({
        message: err.response?.data?.message || 'Failed to remove admin privileges',
        status: 'error',
        show: true
      });
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Show notification using SubmitNotiBox */}
      {notification.show && (
        <SubmitNotiBox 
          message={notification.message}
          status={notification.status}
          duration={5000}
        />
      )}
      
      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={modalOpen}
        title={modalTitle}
        message={modalMessage}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />
    
      {/* Hero Section - Keeping unchanged as requested */}
      <div
        className="relative h-[60vh] bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/40 backdrop-blur-[1px]">
          <div className="max-w-7xl mx-auto h-full flex flex-col justify-end pb-24 px-4 sm:px-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-md mt-20">
              Administrator<br />
              <span className="text-blue-400 drop-shadow-lg">Management</span>
            </h1>
            <p className="mt-3 text-white/90 text-lg sm:text-xl max-w-2xl drop-shadow-sm">
              Add, view, and manage administrator privileges across the platform
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Messages and Errors */}
        {message && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded shadow-sm flex items-center transition-all duration-500 animate-fadeIn">
            <svg className="h-6 w-6 mr-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="ml-auto">
              <svg className="h-4 w-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm flex items-center transition-all duration-500 animate-fadeIn">
            <svg className="h-6 w-6 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto">
              <svg className="h-4 w-4 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Admin List - Now in sidebar position */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Current Administrators
              </h2>
              
              {loading && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
              
              {!loading && admins.length === 0 && (
                <div className="bg-gray-50 p-4 rounded-md text-gray-500 text-center">
                  No administrators found.
                </div>
              )}
              
              {!loading && admins.length > 0 && (
                <div className="space-y-3">
                  {admins.map(admin => (
                    <div key={admin.userId} className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-800">{admin.userName || 'N/A'}</div>
                          <div className="text-sm text-gray-500 mb-1">{admin.email}</div>
                          <div className="text-xs text-gray-400">ID: {admin.userId}</div>
                        </div>
                        {parseInt(admin.userId) !== currentUserId ? (
                          <button
                            onClick={() => confirmRemoveAdmin(admin.userId, admin.userName)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50 text-sm font-medium flex items-center"
                          >
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
                          </button>
                        ) : (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Employers Section - Main content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Employers List
              </h2>
              
              {/* Search Box with buttons */}
              <div className="mb-6 flex gap-2">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search employers by name"
                    className="pl-10 border border-gray-300 rounded-md w-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    onKeyPress={(e) => e.key === 'Enter' && searchTerm.trim() && handleSearch()}
                  />
                </div>
                <button 
                  onClick={handleSearch}
                  disabled={loading || !searchTerm.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <span>Search</span>
                </button>
                {isSearching && (
                  <button 
                    onClick={clearSearch}
                    disabled={loading}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors disabled:opacity-50"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              {loading && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              )}
              
              {!loading && employers.length === 0 && (
                <div className="bg-gray-50 p-8 rounded-md text-center">
                  <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 text-lg">No employers found.</p>
                  {isSearching && (
                    <button 
                      onClick={clearSearch} 
                      className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear search and try again
                    </button>
                  )}
                </div>
              )}
              
              {!loading && employers.length > 0 && (
                <>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {employers.map(employer => (
                          <tr key={employer.userId} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employer.userId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{employer.userName || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employer.companyName || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => confirmMakeAdmin(employer.userId, employer.userName)}
                                disabled={loading}
                                className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                              >
                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Make Admin
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-500">
                      {isSearching ? 'Search results' : 'Showing'} page {currentPage} of {totalPages}
                    </div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="sr-only">Previous</span>
                      </button>
                      
                      {totalPages <= 7 ? (
                        // Display all pages if 7 or fewer
                        [...Array(totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => handlePageChange(i + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === i + 1 
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))
                      ) : (
                        // Display limited pages with ellipsis for pagination > 7
                        <>
                          {[...Array(Math.min(3, currentPage - 1))].map((_, i) => (
                            <button
                              key={i}
                              onClick={() => handlePageChange(i + 1)}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              {i + 1}
                            </button>
                          ))}
                          
                          {currentPage > 4 && (
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                              ...
                            </span>
                          )}
                          
                          {currentPage > 3 && currentPage < totalPages - 2 && (
                            <button
                              className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                            >
                              {currentPage}
                            </button>
                          )}
                          
                          {currentPage < totalPages - 3 && (
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                              ...
                            </span>
                          )}
                          
                          {[...Array(Math.min(3, totalPages - currentPage))].map((_, i) => (
                            <button
                              key={totalPages - 3 + i}
                              onClick={() => handlePageChange(totalPages - 2 + i)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === totalPages - 2 + i 
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {totalPages - 2 + i}
                            </button>
                          ))}
                        </>
                      )}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAdmin;