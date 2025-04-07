import axios from "axios";
import { Search } from "lucide-react";
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const baseUrl = window._env_.BASE_URL;
const searchStudents = async (searchTerm, userId, page = 0) => {
  try {
    const response = await axios.get(
      `${baseUrl}/api/student/search?query=${encodeURIComponent(searchTerm)}&page=${page}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`, // Include token for auth
        },
      }
    );
    if (response.status === 200 && response.data.code === 200) {
      console.log("Student search results with follow status:", response.data.data);
      return response.data.data; // Return the data object containing students and totalStudents
    } else {
      throw new Error(response.data.message || "Unexpected response format");
    }
  } catch (error) {
    alert(error.response?.data?.message || error.message || "Search failed. Please try again.");
    console.error("Search error:", error.response?.data || error);
    return null;
  }
};

const StudentSearchBar = ({ onSearchResults, onSearchTermChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  // Extract userId from JWT token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded JWT in SearchBar:", decoded); // Debug: Check token structure
        const userId = decoded.user_id; // Use 'user_id' from your token structure
        if (!userId) {
          throw new Error("User ID not found in token");
        }
        setCurrentUserId(userId);
      } catch (error) {
        console.error("Failed to decode JWT in SearchBar:", error);
        alert("Invalid or expired session. Please log in again.");
      }
    } else {
      alert("No authentication token found. Please log in.");
    }
  }, []);

  const handleSearch = async (page = 0) => {
    if (searchTerm.trim() && currentUserId) {
      console.log("Searching for student:", searchTerm, "with userId:", currentUserId, "page:", page);
      const results = await searchStudents(searchTerm, currentUserId, page);
      if (results && onSearchResults) {
        // Pass both the results and the current search term to parent
        onSearchResults(results, searchTerm);
        // Store the current search term for pagination
        if (onSearchTermChange) {
          onSearchTermChange(searchTerm);
        }
      }
    } else if (!currentUserId) {
      alert("Please log in to search for students.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && searchTerm.trim() && currentUserId) {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center w-full max-w-2xl mx-auto px-4 py-2 bg-white rounded-full shadow-md">
      <div className="flex items-center w-full sm:w-auto flex-1 min-w-0 space-x-2">
        <Search size={18} className="text-gray-500 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search students by name..."
          className="w-full px-4 py-2 text-sm text-gray-700 focus:outline-none bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>
      <button
        className="bg-blue-600 text-white px-5 py-2 text-sm rounded-full hover:bg-blue-700 transition-colors duration-200 ml-2 sm:ml-4 whitespace-nowrap"
        onClick={() => handleSearch(0)}
        disabled={!searchTerm.trim() || !currentUserId} // Disable if no search term or userId
      >
        Search
      </button>
    </div>
  );
};

export default StudentSearchBar;