import axios from "axios";
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import SearchStudentBar from "../SearchStudentBar/SearchStdentBar";

// Hero Section Component
const HeroSectionStudent = ({ onSearchResults }) => {
  return (
    <div>
      <header
        className="relative flex flex-col justify-center items-center text-white text-align h-[70vh] bg-cover bg-center px-6"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80")' }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            Connect with <br />
            <span className="text-blue-400">Friends</span>
          </h1>
          <SearchStudentBar onSearchResults={onSearchResults} />
        </div>
      </header>
    </div>
  );
};

// Main Students Page Component
const StudentsPage = () => {
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

  // Update following status and fetch profile pictures when search results change
  useEffect(() => {
    if (searchResults && searchResults.students?.length > 0) {
      // Filter out the current user and initialize following status
      const filteredStudents = searchResults.students.filter(
        (student) => student.userId !== currentStudentId
      );
      const initialFollowStatus = filteredStudents.reduce((acc, student) => {
        acc[student.userId] = student.follow || false;
        return acc;
      }, {});
      setFollowingStatus(initialFollowStatus);

      // Fetch profile picture URLs for filtered students
      const fetchProfilePictureUrls = async () => {
        const urls = {};
        for (const student of filteredStudents) {
          try {
            const response = await axios.get(
              `http://localhost:8100/api/user/${student.userId}/profile-picture`,
              {
                headers: {
                  "Authorization": `Bearer ${localStorage.getItem("token")}`,
                  "Content-Type": "application/json",
                },
              }
            );
            console.log(`Profile picture response for user ${student.userId}:`, response.data);
            const pictureUrl = response.data.data || null;
            urls[student.userId] = pictureUrl;
          } catch (error) {
            console.error(`Failed to fetch profile picture URL for user ${student.userId}:`, error.response?.data || error.message);
            urls[student.userId] = null;
          }
        }
        setProfilePictureUrls(urls);
      };
      fetchProfilePictureUrls();
    }
  }, [searchResults, currentStudentId]);

  const handleFollowToggle = async (targetStudentId) => {
    if (!currentStudentId) {
      alert("Please log in to follow students.");
      return;
    }

    const isFollowing = followingStatus[targetStudentId];
    const url = isFollowing
      ? `http://localhost:8100/follows/${currentStudentId}/unfollowstudents/${targetStudentId}`
      : `http://localhost:8100/follows/${currentStudentId}/followstudents/${targetStudentId}`;
    const method = isFollowing ? "delete" : "post";

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
          [targetStudentId]: !isFollowing,
        }));
        alert(`${isFollowing ? "Unfollowed" : "Followed"} student successfully!`);
      }
    } catch (error) {
      console.error("Follow/Unfollow error:", error.response?.data || error.message);
      alert(error.response?.data?.message || `${isFollowing ? "Unfollow" : "Follow"} failed. Please try again.`);
    }
  };

  const defaultProfilePicture = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <HeroSectionStudent onSearchResults={setSearchResults} />

      {/* Students List */}
      <section className="container mx-auto px-4 py-8">
        {searchResults ? (
          (() => {
            const filteredStudents = searchResults.students.filter(
              (student) => student.userId !== currentStudentId
            );
            if (filteredStudents.length > 0) {
              return (
                <div>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Found {filteredStudents.length} Student(s)
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map((student) => (
                      <div
                        key={student.userId}
                        className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center"
                      >
                        <img
                          src={profilePictureUrls[student.userId] || defaultProfilePicture}
                          alt={student.displayName}
                          className="w-24 h-24 rounded-full object-cover mb-4"
                          onError={(e) => (e.target.src = defaultProfilePicture)}
                        />
                        <h3 className="text-lg font-medium text-gray-900">{student.displayName}</h3>
                        <p className="text-sm text-gray-600 mb-4">{student.university}</p>
                        <button
                          onClick={() => handleFollowToggle(student.userId)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                            followingStatus[student.userId]
                              ? "bg-gray-500 text-white hover:bg-gray-600"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                          disabled={!currentStudentId}
                        >
                          {followingStatus[student.userId] ? "Following" : "Follow"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            } else {
              return <p className="text-center text-gray-600">No students found.</p>;
            }
          })()
        ) : (
          <p className="text-center text-gray-600">Search for students to see results here.</p>
        )}
      </section>
    </div>
  );
};

export default StudentsPage;