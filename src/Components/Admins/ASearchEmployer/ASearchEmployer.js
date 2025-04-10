import axios from "axios";
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";
import ASearchEmployerBar from "../ASearchEmployerBar/ASearchEmployerBar";

const baseUrl = window._env_.BASE_URL;
// Hero Section Component
const HeroSectionEmployer = ({ onSearchResults, onSearchTermChange }) => {
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
                    <ASearchEmployerBar 
                      onSearchResults={onSearchResults} 
                      onSearchTermChange={onSearchTermChange}
                    />
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
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");

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

  // Fetch all employers when component mounts or page changes
  useEffect(() => {
    // Don't fetch if search is active
    if (isSearchActive) return;
    
    const fetchAllEmployers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${baseUrl}/api/employers?page=${currentPage}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Fetched employers:", response.data);
        
        // Handle the actual response structure from the API
        if (response.data && response.data.data) {
          const { users, totalUsers } = response.data.data;
          
          // Calculate total pages (assuming 10 users per page, adjust as needed)
          const usersPerPage = 10;
          const calculatedTotalPages = Math.ceil(totalUsers / usersPerPage);
          
          setSearchResults({
            employers: users || []
          });
          setTotalPages(calculatedTotalPages || 1);
        }
      } catch (error) {
        console.error("Failed to fetch employers:", error.response?.data || error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllEmployers();
  }, [currentPage, isSearchActive]);

  // Fetch profile pictures when search results change
  useEffect(() => {
    if (searchResults?.employers?.length > 0) {
      // Filter out the current user
      const filteredEmployers = searchResults.employers.filter(
        (employer) => employer.userId !== currentStudentId
      );
      
      // Create map of user IDs to fetch profile pictures
      const fetchProfilePictures = async () => {
        const pictureUrls = {};
        const token = localStorage.getItem("token");
        
        // Process each employer to determine if we need to fetch their profile picture
        for (const employer of filteredEmployers) {
          try {
            // Fetch profile picture from API
            const response = await axios.get(
              `${baseUrl}/api/user/${employer.userId}/profile-picture`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            
            if (response.data.code === 200 && response.data.data) {
              pictureUrls[employer.userId] = response.data.data;
            } else {
              // Fallback to UI avatars if API doesn't return valid data
              pictureUrls[employer.userId] = `https://ui-avatars.com/api/?name=${encodeURIComponent(employer.companyName)}&background=random`;
            }
          } catch (error) {
            console.warn(`Failed to fetch profile picture for user ${employer.userId}:`, error);
            pictureUrls[employer.userId] = `https://ui-avatars.com/api/?name=${encodeURIComponent(employer.companyName)}&background=random`;
          }
        }
        
        setProfilePictureUrls(pictureUrls);
      };
      
      fetchProfilePictures();
    }
  }, [searchResults, currentStudentId]);

  const handlePageChange = (pageNumber) => {
    // Pages are zero-indexed in the API, but we display as 1-indexed for users
    setCurrentPage(pageNumber - 1);
    
    // If we're in search mode, we need to perform a search with the new page
    if (isSearchActive && currentSearchTerm) {
      performSearchWithPage(currentSearchTerm, pageNumber - 1);
    }
    
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const performSearchWithPage = async (searchTerm, page) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/api/employers/search?query=${encodeURIComponent(searchTerm)}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (response.status === 200 && response.data.code === 200) {
        const { users, totalUsers } = response.data.data;
        
        // Calculate total pages (assuming 10 users per page, adjust as needed)
        const usersPerPage = 10;
        const calculatedTotalPages = Math.ceil(totalUsers / usersPerPage);
        
        setSearchResults({
          employers: users || []
        });
        setTotalPages(calculatedTotalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch search results:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearchResults = (results, searchTerm) => {
    if (results) {
      setIsSearchActive(true);
      setSearchResults(results);
      setCurrentSearchTerm(searchTerm);
      setCurrentPage(0); // Reset to first page when new search is performed
      
      // Calculate total pages based on totalUsers from search results
      if (results.totalUsers) {
        const usersPerPage = 10;
        const calculatedTotalPages = Math.ceil(results.totalUsers / usersPerPage);
        setTotalPages(calculatedTotalPages || 1);
      }
    }
  };
  
  const handleSearchTermChange = (searchTerm) => {
    setCurrentSearchTerm(searchTerm);
  };
  
  const clearSearchFilter = () => {
    setIsSearchActive(false);
    setCurrentPage(0); // Reset to first page
    setCurrentSearchTerm(""); // Clear the search term
    // The useEffect will automatically fetch all employers now
  };

  const defaultProfilePicture = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <HeroSectionEmployer 
        onSearchResults={handleSearchResults}
        onSearchTermChange={handleSearchTermChange}
      />

      {/* Employers List */}
      <section className="container mx-auto px-4 py-8 max-w-6xl">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading employers...</p>
          </div>
        ) : searchResults?.employers ? (
          (() => {
            const filteredEmployers = searchResults.employers.filter(
              (employer) => employer.userId !== currentStudentId
            );
            if (filteredEmployers.length > 0) {
              return (
                <div className="w-full">
                  <div className="flex flex-wrap justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 flex items-center mb-2 md:mb-0">
                      <span className="mr-2">Found {filteredEmployers.length} Employer(s)</span>
                      <span className="text-sm text-gray-500 font-normal">(Click on cards to view full profile)</span>
                    </h2>
                    
                    {/* Clear Filter Button - only show when search is active */}
                    {isSearchActive && (
                      <button
                        onClick={clearSearchFilter}
                        className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Clear Filter
                      </button>
                    )}
                  </div>
                  
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
                              src={profilePictureUrls[employer.userId] || `https://ui-avatars.com/api/?name=${encodeURIComponent(employer.companyName)}&background=random`}
                              alt={employer.companyName}
                              className="w-24 h-24 rounded-full object-cover border-2 border-blue-100"
                              onError={(e) => (e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(employer.companyName)}&background=random`)}
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
                          
                          {/* Send Notification Button */}
                          <Link 
                            to={`/a-notification?userId=${employer.userId}`}
                            className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z"/>
                            </svg>
                            Send Notification
                          </Link>
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  {/* Pagination Controls - update to show for both search and regular views */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <nav className="flex items-center space-x-2">
                        <button 
                          onClick={() => handlePageChange(currentPage)}
                          disabled={currentPage === 0}
                          className={`px-4 py-2 rounded-md ${
                            currentPage === 0
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          Previous
                        </button>
                        
                        {/* Page numbers - showing as 1-indexed to users */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-md ${
                              currentPage === page - 1
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        
                        <button 
                          onClick={() => handlePageChange(currentPage + 2)}
                          disabled={currentPage === totalPages - 1}
                          className={`px-4 py-2 rounded-md ${
                            currentPage === totalPages - 1
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  )}
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
                    
                    {isSearchActive && (
                      <button
                        onClick={clearSearchFilter}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      >
                        View All Employers
                      </button>
                    )}
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