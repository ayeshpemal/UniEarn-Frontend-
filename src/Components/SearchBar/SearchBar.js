import { Search, Calendar, MapPin } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

const locations = [
  "AMPARA", "ANURADHAPURA", "BADULLA", "BATTICALOA", "COLOMBO", "GALLE", "GAMPAHA", "HAMBANTOTA", "JAFFNA",
  "KALUTARA", "KANDY", "KEGALLE", "KILINOCHCHI", "KURUNEGALA", "MANNAR", "MATARA", "MATALE", "MONERAGALA",
  "MULLAITIVU", "NUWARA_ELIYA", "POLONNARUWA", "PUTTALAM", "RATNAPURA", "TRINCOMALEE", "VAUNIYA"
];

const jobs = [
  "CASHIER", "SALESMEN", "RETAIL", "TUTORING", "CATERING", "EVENT_BASED", "FOOD_AND_BEVERAGE", "DELIVERY",
  "MASCOT_DANCER", "SUPERVISOR", "KITCHEN_HELPER", "STORE_HELPER", "ANNOUNCER", "LEAFLET_DISTRIBUTOR",
  "TYPING", "DATA_ENTRY", "WEB_DEVELOPER", "OTHER"
];

const SearchBar = ({
  selectedLocation,
  setSelectedLocation,
  selectedJob,
  setSelectedJob,
  searchTerm,
  setSearchTerm,
  selectedDate,
  setSelectedDate,
  handleSearch,
}) => {
  const today = new Date().toISOString().split('T')[0];

  // Job dropdown state
  const [isJobDropdownOpen, setIsJobDropdownOpen] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState(selectedJob ? selectedJob.split(',') : []);
  
  // Location dropdown state
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [locationSearchTerm, setLocationSearchTerm] = useState('');
  const [filteredLocations, setFilteredLocations] = useState(locations);
  
  // Refs for closing dropdowns when clicking outside
  const jobDropdownRef = useRef(null);
  const locationDropdownRef = useRef(null);
  
  // Filter locations based on search term
  useEffect(() => {
    if (locationSearchTerm) {
      const filtered = locations.filter(location => 
        location.toLowerCase().includes(locationSearchTerm.toLowerCase())
      );
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations(locations);
    }
  }, [locationSearchTerm]);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (jobDropdownRef.current && !jobDropdownRef.current.contains(event.target)) {
        setIsJobDropdownOpen(false);
      }
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target)) {
        setIsLocationDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Handle key press for search input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  return (
    <div className="mt-6 w-full max-w-4xl mx-auto bg-white rounded-full shadow-md p-2 sm:p-3 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
      {/* Location Dropdown - Improved */}
      <div className="relative w-full sm:w-auto" ref={locationDropdownRef}>
        <button 
          type="button"
          className="w-full sm:w-28 md:w-32 px-2 py-1.5 sm:px-3 sm:py-2 border rounded-full text-gray-700 bg-gray-50 focus:outline-none text-sm sm:text-base truncate flex justify-between items-center"
          onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
        >
          {selectedLocation ? selectedLocation.replace(/_/g, " ") : "Any Location"}
          <span className="ml-1">▼</span>
        </button>
        
        {isLocationDropdownOpen && (
          <div className="absolute z-10 mt-1 w-56 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
            <div className="sticky top-0 bg-gray-100 px-2 py-2 border-b">
              <div className="relative">
                <MapPin size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search location..."
                  className="w-full pl-7 pr-2 py-1 text-sm border rounded text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={locationSearchTerm}
                  onChange={(e) => setLocationSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="p-1">
              <div 
                className="px-3 py-1.5 hover:bg-gray-100 rounded cursor-pointer text-gray-800"
                onClick={() => {
                  setSelectedLocation("");
                  setIsLocationDropdownOpen(false);
                }}
              >
                Any Location
              </div>
              
              {filteredLocations.map((location, index) => (
                <div 
                  key={index} 
                  className="px-3 py-1.5 hover:bg-gray-100 rounded cursor-pointer text-gray-800"
                  onClick={() => {
                    setSelectedLocation(location);
                    setIsLocationDropdownOpen(false);
                  }}
                >
                  {location.replace(/_/g, " ")}
                </div>
              ))}
              
              {filteredLocations.length === 0 && (
                <div className="px-3 py-2 text-gray-500 text-sm italic">
                  No locations found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Job Dropdown - Improved */}
      <div className="relative w-full sm:w-auto" ref={jobDropdownRef}>
        <button 
          type="button"
          className="w-full sm:w-28 md:w-32 px-2 py-1.5 sm:px-3 sm:py-2 border rounded-full text-gray-700 bg-gray-50 focus:outline-none text-sm sm:text-base truncate flex justify-between items-center"
          onClick={() => setIsJobDropdownOpen(!isJobDropdownOpen)}
        >
          {selectedJobs.length > 0 ? `${selectedJobs.length} selected` : "Any Job"}
          <span className="ml-1">▼</span>
        </button>
        
        {isJobDropdownOpen && (
          <div className="absolute z-10 mt-1 w-56 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
            <div className="sticky top-0 bg-gray-100 px-4 py-2 font-medium border-b text-gray-800">
              Job Categories
            </div>
            
            <div className="p-2">
              <div className="mb-2 flex flex-wrap gap-1">
                <button
                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded"
                  onClick={() => {
                    setSelectedJobs([]);
                    setSelectedJob("");
                  }}
                >
                  Clear All
                </button>
                <button
                  className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 py-1 px-2 rounded"
                  onClick={() => {
                    setSelectedJobs(jobs);
                    setSelectedJob(jobs.join(','));
                  }}
                >
                  Select All
                </button>
              </div>
              
              {jobs.map((job, index) => (
                <div 
                  key={index} 
                  className="px-3 py-1.5 hover:bg-gray-100 rounded text-gray-800"
                >
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-2 h-4 w-4 accent-blue-600"
                      value={job}
                      checked={selectedJobs.includes(job)}
                      onChange={(e) => {
                        const updatedJobs = e.target.checked
                          ? [...selectedJobs, job]
                          : selectedJobs.filter(j => j !== job);
                        setSelectedJobs(updatedJobs);
                        setSelectedJob(updatedJobs.join(','));
                      }}
                    />
                    <span className="text-gray-800">
                      {job.replace(/_/g, " ")}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Date Selector */}
      <div className="relative flex items-center w-full sm:w-auto">
        <Calendar size={16} className="absolute left-3 text-gray-500 sm:size-18" />
        <input
          type="date"
          className="w-full pl-9 pr-3 py-1.5 sm:py-2 border rounded-full text-gray-700 bg-gray-50 focus:outline-none text-sm sm:text-base"
          value={selectedDate || ""}
          max={today}
          onChange={(e) => setSelectedDate(e.target.value)}
          placeholder="Select date"
          onKeyPress={handleKeyPress}
        />
        {selectedDate && (
          <button 
            className="absolute right-3 text-gray-400 hover:text-gray-600"
            onClick={() => setSelectedDate("")}
            title="Clear date"
          >
            ×
          </button>
        )}
      </div>

      {/* Search Input with Enter key functionality */}
      <div className="relative flex items-center w-full sm:flex-1">
        <Search size={16} className="absolute left-3 text-gray-500 sm:size-18" />
        <input
          type="text"
          placeholder="Job, Category, Keyword, Company"
          className="w-full pl-9 pr-4 py-1.5 sm:py-2 text-sm sm:text-base focus:outline-none text-gray-700 rounded-full border bg-gray-50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>

      {/* Search Button */}
      <button
        className="w-full sm:w-auto bg-blue-600 text-white px-4 py-1.5 sm:px-5 sm:py-2 text-sm sm:text-base rounded-full hover:bg-blue-700 transition"
        onClick={handleSearch}
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;