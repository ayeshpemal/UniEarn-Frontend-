import React, { useState } from 'react';
import axios from 'axios';

const baseUrl = window._env_.BASE_URL;
const CreateUsers = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000); // Hide after 5 seconds
  };

  const handleGenerateDummyUsers = async () => {
    try {
      setIsGenerating(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        showNotification('Authentication token not found. Please log in again.', 'error');
        setIsGenerating(false);
        return;
      }
      
      // Make the API request with authorization header
      const response = await axios.post(`${baseUrl}/api/admin/generate-dummy-users`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 200) {
        showNotification('Dummy users generated successfully!', 'success');
      } else {
        showNotification('Failed to generate dummy users', 'error');
      }
    } catch (error) {
      console.error('Error generating dummy users:', error);
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        showNotification('Unauthorized access. Please log in again.', 'error');
      } else if (error.response?.status === 403) {
        showNotification('You do not have permission to generate dummy users.', 'error');
      } else {
        showNotification(error.response?.data?.message || 'Failed to generate dummy users', 'error');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Create Users</h2>
      
      {/* Notification */}
      {notification.show && (
        <div className={`mb-4 p-3 rounded-md ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {notification.message}
        </div>
      )}
      
      {/* Your existing user creation form would go here */}
      
      {/* Dummy Users Generation Section */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Generate Dummy Users</h3>
        <p className="mt-1 text-sm text-gray-600">
          Create test accounts for system testing and development purposes.
        </p>
        <button
          onClick={handleGenerateDummyUsers}
          disabled={isGenerating}
          className={`mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${isGenerating 
              ? 'bg-indigo-300 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Generate Dummy Users'
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateUsers;