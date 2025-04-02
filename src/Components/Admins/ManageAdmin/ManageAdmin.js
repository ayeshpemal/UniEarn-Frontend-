import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

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
      setUserId('');
      setError('');
      fetchAdmins();
    } catch (err) {
      console.error('Error making admin:', err);
      setError(err.response?.data?.message || 'Failed to make user an admin');
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
      setError('');
      fetchAdmins();
    } catch (err) {
      console.error('Error removing admin:', err);
      setError(err.response?.data?.message || 'Failed to remove admin privileges');
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={modalOpen}
        title={modalTitle}
        message={modalMessage}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />
    
      {/* Hero Section */}
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

      <div className="container mx-auto px-4 py-8">
        {/* Messages and Errors */}
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Employers Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Employers List</h2>
          
          {/* Search Box with buttons */}
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search employers by name"
              className="border border-gray-300 rounded px-4 py-2 flex-grow"
            />
            <button 
              onClick={handleSearch}
              disabled={loading || !searchTerm.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Search
            </button>
            {isSearching && (
              <button 
                onClick={clearSearch}
                disabled={loading}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
              >
                Clear
              </button>
            )}
          </div>
          
          {loading && <p className="text-gray-500">Loading employers...</p>}
          
          {!loading && employers.length === 0 && (
            <p className="text-gray-500">No employers found.</p>
          )}
          
          {!loading && employers.length > 0 && (
            <>
              <div className="overflow-x-auto">
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
                      <tr key={employer.userId}>
                        <td className="px-6 py-4 whitespace-nowrap">{employer.userId}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{employer.userName || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{employer.companyName || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => confirmMakeAdmin(employer.userId, employer.userName)}
                            disabled={loading}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            Make Admin
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-center mt-6">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === i + 1 ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </>
          )}
        </div>

        {/* Admin List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Current Administrators</h2>
          
          {loading && <p className="text-gray-500">Loading administrators...</p>}
          
          {!loading && admins.length === 0 && (
            <p className="text-gray-500">No administrators found.</p>
          )}
          
          {!loading && admins.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {admins.map(admin => (
                    <tr key={admin.userId}>
                      <td className="px-6 py-4 whitespace-nowrap">{admin.userId}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{admin.userName || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{admin.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {parseInt(admin.userId) !== currentUserId ? (
                          <button
                            onClick={() => confirmRemoveAdmin(admin.userId, admin.userName)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            Remove Admin
                          </button>
                        ) : (
                          <span className="text-gray-500 italic">Current User</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAdmin;