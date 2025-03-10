import { Search } from "lucide-react";
import React from "react";

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
  handleSearch,
}) => {
  return (
    <div className="mt-6 w-full max-w-4xl mx-auto bg-white rounded-full shadow-md p-2 sm:p-3 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
      {/* Location Dropdown */}
      <select
        className="w-full sm:w-28 md:w-32 px-2 py-1.5 sm:px-3 sm:py-2 border rounded-full text-gray-700 bg-gray-50 focus:outline-none text-sm sm:text-base truncate"
        value={selectedLocation}
        onChange={(e) => setSelectedLocation(e.target.value)}
      >
        {locations.map((location, index) => (
          <option key={index} value={location}>
            {location}
          </option>
        ))}
      </select>

      {/* Job Dropdown */}
      <select
        className="w-full sm:w-28 md:w-32 px-2 py-1.5 sm:px-3 sm:py-2 border rounded-full text-gray-700 bg-gray-50 focus:outline-none text-sm sm:text-base truncate"
        value={selectedJob}
        onChange={(e) => setSelectedJob(e.target.value)}
      >
        {jobs.map((job, index) => (
          <option key={index} value={job}>
            {job}
          </option>
        ))}
      </select>

      {/* Search Input */}
      <div className="relative flex items-center w-full sm:flex-1">
        <Search size={16} className="absolute left-3 text-gray-500 sm:size-18" />
        <input
          type="text"
          placeholder="Job, Category, Keyword, Company"
          className="w-full pl-9 pr-4 py-1.5 sm:py-2 text-sm sm:text-base focus:outline-none text-gray-700 rounded-full border bg-gray-50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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