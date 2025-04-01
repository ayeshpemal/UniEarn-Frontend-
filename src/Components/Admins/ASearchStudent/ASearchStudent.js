import axios from "axios";
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";
import ASearchStudentBar from "../ASearchStudentBar/ASearchStudentBar";

// Hero Section Component
const HeroSectionStudent = ({ onSearchResults }) => {
  return (
    <div>
      <div
        className="relative h-[60vh] bg-cover bg-center"
        style={{
            backgroundImage:
                'url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/40 backdrop-blur-[1px]">
            <div className="max-w-7xl mx-auto h-full flex flex-col justify-end pb-24 px-4 sm:px-6">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-md mt-20">
                    Find<br />
                    <span className="text-blue-400 drop-shadow-lg">Students</span>
                </h1>
                <p className="mt-3 text-white/90 text-lg sm:text-xl max-w-2xl drop-shadow-sm mb-6">
                    Search for student profiles
                </p>
                <div className="relative z-10">
                    <ASearchStudentBar onSearchResults={onSearchResults} />
                </div>
            </div>
        </div>
      </div>
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
    if (searchResults?.students?.length > 0) { // Safe check for searchResults and students
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
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
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

  const defaultProfilePicture = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <HeroSectionStudent onSearchResults={setSearchResults} />

      {/* Students List */}
      <section className="container mx-auto px-4 py-8 max-w-6xl">
        {searchResults?.students ? ( // Check if students exists
          (() => {
            const filteredStudents = searchResults.students.filter(
              (student) => student.userId !== currentStudentId
            );
            if (filteredStudents.length > 0) {
              return (
                <div className="w-full">
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Found {filteredStudents.length} Student(s)
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map((student) => (
                      <Link 
                      to={`/profile?userId=${student.userId}`}
                      key={student.userId}
                      className="w-full"
                      >
                        <div
                          className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center w-full"
                        >
                          <img
                            src={profilePictureUrls[student.userId] || defaultProfilePicture}
                            alt={student.displayName}
                            className="w-24 h-24 rounded-full object-cover mb-4"
                            onError={(e) => (e.target.src = defaultProfilePicture)}
                          />
                          <h3 className="text-lg font-medium text-gray-900">{student.displayName}</h3>
                          <p className="text-sm text-gray-600 mb-4">{student.university}</p>
                        </div>
                      </Link>
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