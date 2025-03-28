import axios from "axios";
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";
import ASearchEmployerBar from "../ASearchEmployerBar/ASearchEmployerBar"; // Assuming this is the correct import path

// Hero Section Component
const HeroSectionEmployer = ({ onSearchResults }) => {
  return (
    <div>
      <header
        className="relative flex flex-col justify-center items-center text-white text-align h-[70vh] bg-cover bg-center px-6"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80")' }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            Find <br />
            <span className="text-blue-400">Company</span>
          </h1>
          <ASearchEmployerBar onSearchResults={onSearchResults} />
        </div>
      </header>
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
        {searchResults ? (
          (() => {
            const filteredEmployers = searchResults.employers.filter(
              (employer) => employer.userId !== currentStudentId
            );
            if (filteredEmployers.length > 0) {
              return (
                <div className="w-full">
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Found {filteredEmployers.length} Employer(s)
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEmployers.map((employer) => (
                      <Link 
                      to={`/e-profile?userId=${employer.userId}`}
                      key={employer.userId}
                      className="w-full"
                      >
                        <div
                          key={employer.userId}
                          className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center w-full"
                        >
                          <img
                            src={profilePictureUrls[employer.userId] || defaultProfilePicture}
                            alt={employer.companyName}
                            className="w-24 h-24 rounded-full object-cover mb-4"
                            onError={(e) => (e.target.src = defaultProfilePicture)}
                          />
                          <h3 className="text-lg font-medium text-gray-900">{employer.companyName}</h3>
                          <p className="text-sm text-gray-600 mb-2">{employer.companyDetails}</p>
                          <p className="text-sm text-gray-600 mb-4">{employer.location}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            } else {
              return <p className="text-center text-gray-600">No employers found.</p>;
            }
          })()
        ) : (
          <p className="text-center text-gray-600">Search for employers to see results here.</p>
        )}
      </section>
    </div>
  );
};

export default EmployersPage;