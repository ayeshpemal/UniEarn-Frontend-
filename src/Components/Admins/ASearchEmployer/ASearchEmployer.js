import axios from "axios";
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";
import ASearchEmployerBar from "../ASearchEmployerBar/ASearchEmployerBar"; // Assuming this is the correct import path

// Update the HeroSectionEmployer component

// Replace the existing HeroSectionEmployer component
const HeroSectionEmployer = ({ onSearchResults }) => {
  return (
    <div>
      <div
        className="relative h-[60vh] bg-cover bg-center"
        style={{
            backgroundImage:
                'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/40 backdrop-blur-[1px]">
            <div className="max-w-7xl mx-auto h-full flex flex-col justify-end pb-24 px-4 sm:px-6">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-md mt-20">
                    Manage<br />
                    <span className="text-blue-400 drop-shadow-lg">Companies</span>
                </h1>
                <p className="mt-3 text-white/90 text-lg sm:text-xl max-w-2xl drop-shadow-sm mb-6">
                    Search and oversee employer accounts on the platform
                </p>
                <div className="relative z-10">
                    <ASearchEmployerBar onSearchResults={onSearchResults} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// Main Employers Page Component
const EmployersPage = () => {
  const [searchResults, setSearchResults] = useState(null);
  const [followingStatus, setFollowingStatus] = useState({});
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const [profilePictureUrls, setProfilePictureUrls] = useState({});

  // Extract current student ID from JWT token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded JWT:", decoded);
        const userId = decoded.user_id; // Matches token structure: "user_id": 1
        if (!userId) {
          throw new Error("User ID not found in token");
        }
        setCurrentStudentId(userId);
      } catch (error) {
        console.error("Failed to decode JWT:", error);
        alert("Invalid or expired session. Please log in again.");
      }
    } else {
      alert("No authentication token found. Please log in.");
    }
  }, []);

  // Update following status and fetch profile pictures when search results change
  useEffect(() => {
    if (searchResults && searchResults.employers?.length > 0) {
      // Filter out the current user (if applicable) and initialize following status
      const filteredEmployers = searchResults.employers.filter(
        (employer) => employer.userId !== currentStudentId
      );
      const initialFollowStatus = filteredEmployers.reduce((acc, employer) => {
        acc[employer.userId] = employer.follow || false;
        return acc;
      }, {});
      setFollowingStatus(initialFollowStatus);

      // Fetch profile picture URLs for filtered employers
      const fetchProfilePictureUrls = async () => {
        const urls = {};
        for (const employer of filteredEmployers) {
          try {
            const response = await axios.get(
              `http://localhost:8100/api/user/${employer.userId}/profile-picture`,
              {
                headers: {
                  "Authorization": `Bearer ${localStorage.getItem("token")}`,
                  "Content-Type": "application/json",
                },
              }
            );
            console.log(`Profile picture response for user ${employer.userId}:`, response.data);
            const pictureUrl = response.data.data || null;
            urls[employer.userId] = pictureUrl;
          } catch (error) {
            console.error(`Failed to fetch profile picture URL for user ${employer.userId}:`, error.response?.data || error.message);
            urls[employer.userId] = null;
          }
        }
        setProfilePictureUrls(urls);
      };
      fetchProfilePictureUrls();
    }
  }, [searchResults, currentStudentId]);

  const defaultProfilePicture = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <HeroSectionEmployer onSearchResults={setSearchResults} />

      {/* Employers List */}
      <section className="container mx-auto px-4 py-8 max-w-6xl">
        {searchResults?.employers ? (
          (() => {
            const filteredEmployers = searchResults.employers.filter(
              (employer) => employer.userId !== currentStudentId
            );
            if (filteredEmployers.length > 0) {
              return (
                <div className="w-full">
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
                    <span className="mr-2">Found {filteredEmployers.length} Employer(s)</span>
                    <span className="text-sm text-gray-500 font-normal">(Click on cards to view full profile)</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEmployers.map((employer) => (
                      <Link 
                      to={`/e-profile?userId=${employer.userId}`}
                      key={employer.userId}
                      className="w-full transition-transform duration-300 hover:scale-[1.02]"
                      >
                        <div
                          className="bg-white rounded-lg shadow-md hover:shadow-lg p-6 flex flex-col items-center text-center w-full border border-gray-100"
                        >
                          <div className="relative mb-4">
                            <img
                              src={profilePictureUrls[employer.userId] || defaultProfilePicture}
                              alt={employer.companyName}
                              className="w-24 h-24 rounded-full object-cover border-2 border-blue-100"
                              onError={(e) => (e.target.src = defaultProfilePicture)}
                            />
                            <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              E
                            </div>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900">{employer.companyName}</h3>
                          <p className="text-sm text-gray-600 mb-2">{employer.companyDetails}</p>
                          <div className="flex items-center justify-center text-sm text-gray-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {employer.location}
                          </div>
                          
                          {/* Show Reports Button */}
                          <Link 
                            to={`/a-report?userId=${employer.userId}`}
                            className="mt-2 w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0-9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm0 2a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0v-4a1 1 0 0 0-1-1z"/>
                            </svg>
                            View Reports
                          </Link>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            } else {
              return (
                <div className="text-center py-12">
                  <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-600 text-lg font-medium">No employers found.</p>
                    <p className="text-gray-500 mt-2">Try adjusting your search criteria.</p>
                  </div>
                </div>
              );
            }
          })()
        ) : (
          <div className="text-center py-12">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-blue-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-600 text-lg font-medium">Search for employers</p>
              <p className="text-gray-500 mt-2">Enter company name or location above to see matching profiles.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default EmployersPage;