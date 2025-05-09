import axios from "axios";
import { Search } from "lucide-react";
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const baseUrl = window._env_.BASE_URL;
const searchStudents = async (searchTerm, userId, page = 0) => {
  try {
    const response = await axios.get(
      `${baseUrl}/api/student/search-with-follow-status?userId=${userId}&query=${encodeURIComponent(searchTerm)}&page=${page}`,
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

const StudentSearchBar = ({ onSearchResults, currentPage = 0 }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [lastSearchTerm, setLastSearchTerm] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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

  // Fetch initial results when userId is set
  useEffect(() => {
    if (currentUserId && isInitialLoad) {
      fetchInitialResults();
      setIsInitialLoad(false);
    }
  }, [currentUserId]);

  // Effect to handle pagination changes
  useEffect(() => {
    if (lastSearchTerm !== null && currentUserId) {
      performSearch(lastSearchTerm, currentPage);
    }
  }, [currentPage, currentUserId]);

  const fetchInitialResults = async () => {
    console.log("Fetching initial student results with userId:", currentUserId);
    const results = await searchStudents("", currentUserId, 0);
    if (results && onSearchResults) {
      setLastSearchTerm(""); // Set last search term to empty string
      onSearchResults(results, ""); // Pass empty search term to parent
    }
  };

  const performSearch = async (term, page) => {
    console.log(`Searching for "${term}" on page ${page} with userId:`, currentUserId);
    const results = await searchStudents(term, currentUserId, page);
    if (results && onSearchResults) {
      onSearchResults(results, term); // Pass results and search term to parent
    }
  };

  const handleSearch = async () => {
    if (currentUserId) {
      setLastSearchTerm(searchTerm);
      performSearch(searchTerm, 0); // Reset to first page on new search
    } else {
      alert("Please log in to search for students.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && currentUserId) {
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
        onClick={handleSearch}
        disabled={!currentUserId} // Only disable if no userId
      >
        Search
      </button>
    </div>
  );
};

export default StudentSearchBar;