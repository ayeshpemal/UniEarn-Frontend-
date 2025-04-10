import axios from "axios";
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import SearchEmployerBar from "../SearchEmployerBar/SearchEmployerBar";
import { ChevronLeft, ChevronRight, UserCheck, User, Loader, Building } from "lucide-react";
import SubmitNotiBox from "../SubmitNotiBox/SubmitNotiBox";

const baseUrl = window._env_.BASE_URL;
// Hero Section Component with enhanced styling
const HeroSectionEmployer = ({ onSearchResults, currentPage }) => {
  return (
    <div>
      <header
        className="relative h-[60vh] bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/40 backdrop-blur-[1px]">
          <div className="max-w-7xl mx-auto h-full flex flex-col justify-end pb-24 px-4 sm:px-6">
            <div className="animate-fadeIn">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-md mt-20">
                Connect with <br />
                <span className="text-blue-400 drop-shadow-lg">Employers</span>
              </h1>
            </div>
            <SearchEmployerBar onSearchResults={onSearchResults} currentPage={currentPage} />
          </div>
        </div>
      </header>
    </div>
  );
};

// Simplified Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-center mt-8 mb-4">
      <div className="inline-flex rounded-md shadow-sm">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
            currentPage === 0 
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" 
              : "bg-white text-blue-600 hover:bg-blue-50 border-gray-200"
          }`}
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
        </button>
        
        <div className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border-t border-b border-gray-200">
          Page {currentPage + 1} of {Math.max(1, totalPages)}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className={`px-4 py-2 text-sm font-medium rounded-r-md border ${
            currentPage >= totalPages - 1 
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" 
              : "bg-white text-blue-600 hover:bg-blue-50 border-gray-200"
          }`}
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

// Employer Card Component for cleaner code organization
const EmployerCard = ({ employer, profilePicture, isFollowing, onFollowToggle, defaultProfilePicture }) => {
  // Generate a UI Avatar URL based on company name
  const uiAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(employer.companyName)}&background=random`;
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
      <div className="p-6 flex flex-col items-center text-center">
        <div className="relative">
          <img
            src={profilePicture || uiAvatarUrl}
            alt={employer.companyName}
            className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-gray-200"
            onError={(e) => (e.target.src = uiAvatarUrl)}
          />
          {isFollowing && (
            <div className="absolute -right-1 -bottom-1 bg-green-500 text-white p-1 rounded-full">
              <UserCheck size={16} />
            </div>
          )}
        </div>
        <h3 className="text-lg font-medium text-gray-900">{employer.companyName}</h3>
        <p className="text-sm text-gray-600 mb-2">{employer.companyDetails}</p>
        <p className="text-xs text-gray-500 mb-4">{employer.location}</p>
        
        <button
          onClick={() => onFollowToggle(employer.userId)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 w-full flex items-center justify-center ${
            isFollowing
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isFollowing ? (
            <>
              <UserCheck size={16} className="mr-2" /> Following
            </>
          ) : (
            <>
              <User size={16} className="mr-2" /> Follow
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Loading state component
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <Loader size={40} className="text-blue-500 animate-spin mb-4" />
    <p className="text-gray-600">Loading employers...</p>
  </div>
);

// No results component
const NoResults = ({ searchTerm }) => (
  <div className="text-center py-12 px-4">
    <div className="bg-blue-50 rounded-lg p-8 max-w-md mx-auto">
      <Building size={48} className="text-blue-400 mx-auto mb-4" />
      <h3 className="text-xl font-medium text-gray-900 mb-2">No employers found</h3>
      <p className="text-gray-600 mb-4">
        {searchTerm 
          ? `We couldn't find any employers matching "${searchTerm}"`
          : "Try searching for employers by company name"}
      </p>
      <p className="text-sm text-gray-500">
        Try using different keywords or check your spelling
      </p>
    </div>
  </div>
);

// Main Employers Page Component
const EmployersPage = () => {
  const [searchResults, setSearchResults] = useState(null);
  const [followingStatus, setFollowingStatus] = useState({});
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const [profilePictureUrls, setProfilePictureUrls] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const EMPLOYERS_PER_PAGE = 10;
  // Add notification state
  const [notification, setNotification] = useState({
    message: "",
    status: "",
    visible: false
  });

  // Extract current student ID from JWT token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded JWT:", decoded);
        const userId = decoded.user_id;
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

  // Handle search results and calculate pagination
  const handleSearchResults = (results, searchTerm) => {
    setSearchResults(results);
    setCurrentSearchTerm(searchTerm);
    setIsLoading(false);
    
    // Calculate total pages based on total employers
    // If your API doesn't return a totalEmployers count, you can estimate it
    const totalEmployers = results.totalEmployers || results.employers?.length || 0;
    const calculatedTotalPages = Math.ceil(totalEmployers / EMPLOYERS_PER_PAGE);
    setTotalPages(calculatedTotalPages || 1); // Ensure at least 1 page
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setIsLoading(true);
      setCurrentPage(newPage);
    }
  };

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
          // Check if the user already has a profile picture URL
          if (employer.profilePictureUrl) {
            urls[employer.userId] = employer.profilePictureUrl;
          } else {
            try {
              const response = await axios.get(
                `${baseUrl}/api/user/${employer.userId}/profile-picture`,
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
        }
        setProfilePictureUrls(urls);
      };
      fetchProfilePictureUrls();
    }
  }, [searchResults, currentStudentId]);

  const handleFollowToggle = async (targetEmployerId) => {
    if (!currentStudentId) {
      // Replace alert with notification
      setNotification({
        message: "Please log in to follow employers.",
        status: "error",
        visible: true
      });
      return;
    }

    const isFollowing = followingStatus[targetEmployerId];
    let url, method;

    if (isFollowing) {
      // Unfollow API
      url = `${baseUrl}/follows/unfollow?studentId=${currentStudentId}&employerId=${targetEmployerId}`;
      method = "delete";
    } else {
      // Follow API
      url = `${baseUrl}/follows/${targetEmployerId}/follow?studentId=${currentStudentId}`;
      method = "post";
    }

    console.log(`Calling ${method.toUpperCase()} ${url}`);

    try {
      const response = await axios({
        method,
        url,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 200) {
        setFollowingStatus((prev) => ({
          ...prev,
          [targetEmployerId]: !isFollowing,
        }));
        
        // Replace custom toast with SubmitNotiBox
        setNotification({
          message: isFollowing ? "Successfully unfollowed employer" : "Successfully following employer",
          status: "success",
          visible: true
        });
      }
    } catch (error) {
      console.error("Follow/Unfollow error:", error.response?.data || error.message);
      
      // Show error notification instead of alert
      setNotification({
        message: error.response?.data?.message || `${isFollowing ? "Unfollow" : "Follow"} failed. Please try again.`,
        status: "error",
        visible: true
      });
    }
  };

  const defaultProfilePicture = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSectionEmployer onSearchResults={handleSearchResults} currentPage={currentPage} />

      {/* Employers List */}
      <section className="container mx-auto px-4 py-10">
        {isLoading ? (
          <LoadingState />
        ) : searchResults ? (
          (() => {
            const filteredEmployers = searchResults.employers?.filter(
              (employer) => employer.userId !== currentStudentId
            ) || [];
            
            if (filteredEmployers.length > 0) {
              return (
                <div className="animate-fadeIn">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-8">
                    Found {searchResults.totalEmployers || filteredEmployers.length} Employer{(searchResults.totalEmployers || filteredEmployers.length) !== 1 ? 's' : ''}
                    {currentSearchTerm && (
                      <span className="text-lg font-normal ml-2 text-gray-600">for "{currentSearchTerm}"</span>
                    )}
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredEmployers.map((employer) => (
                      <EmployerCard
                        key={employer.userId}
                        employer={employer}
                        profilePicture={profilePictureUrls[employer.userId]}
                        isFollowing={followingStatus[employer.userId]}
                        onFollowToggle={handleFollowToggle}
                        defaultProfilePicture={defaultProfilePicture}
                      />
                    ))}
                  </div>
                  
                  {/* Pagination Controls */}
                  {(searchResults.totalEmployers > EMPLOYERS_PER_PAGE || totalPages > 1) && (
                    <Pagination 
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </div>
              );
            } else {
              return <NoResults searchTerm={currentSearchTerm} />;
            }
          })()
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl p-8 max-w-2xl mx-auto shadow-sm border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Find Your Professional Network</h2>
              <p className="text-gray-600 mb-6">
                Connect with employers and companies looking for talent like you.
                Start by searching a company name above.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Add SubmitNotiBox component */}
      {notification.visible && (
        <SubmitNotiBox 
          message={notification.message} 
          status={notification.status} 
          duration={3000} 
        />
      )}
    </div>
  );
};

export default EmployersPage;