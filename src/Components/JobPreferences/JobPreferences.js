import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const baseUrl = window._env_.BASE_URL;
const JOB_CATEGORIES = [
  "CASHIER", "SALESMEN", "RETAIL", "TUTORING", "CATERING", "EVENT_BASED",
  "FOOD_AND_BEVERAGE", "DELIVERY", "MASCOT_DANCER", "SUPERVISOR", "KITCHEN_HELPER",
  "STORE_HELPER", "ANNOUNCER", "LEAFLET_DISTRIBUTOR", "TYPING", "DATA_ENTRY",
  "WEB_DEVELOPER", "OTHER"
];

const JobPreferences = () => {
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get userid from query parameter
  const userid = searchParams.get('userId');

  // Handle checkbox change
  const handlePreferenceChange = (category) => {
    setSelectedPreferences(prev => 
      prev.includes(category)
        ? prev.filter(item => item !== category)
        : [...prev, category]
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedPreferences.length === 0) {
      setError('Please select at least one job preference');
      return;
    }

    setLoading(true);
    setError(null);

    const requestBody = {
      location: null,
      contactNumber: null,
      gender: null,
      preferences: selectedPreferences,
      skills: null,
      companyName: null,
      companyDetails: null
    };

    try {
      await axios.put(`${baseUrl}/api/user/update/${userid}`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      navigate('/sign-in');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-8 transform transition-all hover:shadow-3xl">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Select Your Job Preferences
        </h1>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {JOB_CATEGORIES.map((category) => (
              <div 
                key={category} 
                className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              >
                <input
                  type="checkbox"
                  id={category}
                  value={category}
                  checked={selectedPreferences.includes(category)}
                  onChange={() => handlePreferenceChange(category)}
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded-md cursor-pointer"
                />
                <label
                  htmlFor={category}
                  className="ml-3 text-sm font-medium text-gray-700 capitalize cursor-pointer select-none"
                >
                  {category.replace('_', ' ').toLowerCase()}
                </label>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold text-lg shadow-md hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:ring-opacity-50 transition-all duration-300 ${
              loading ? 'opacity-60 cursor-not-allowed' : 'transform hover:-translate-y-1'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              'Confirm Preferences'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JobPreferences;