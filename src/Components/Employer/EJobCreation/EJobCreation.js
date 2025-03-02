import { useState } from "react";

const LOCATIONS = [
  "AMPARA", "ANURADHAPURA", "BADULLA", "BATTICALOA", "COLOMBO", "GALLE",
  "GAMPAHA", "HAMBANTOTA", "JAFFNA", "KALUTARA", "KANDY", "KEGALLE",
  "KILINOCHCHI", "KURUNEGALA", "MANNAR", "MATARA", "MATALE", "MONERAGALA",
  "MULLAITIVU", "NUWARA_ELIYA", "POLONNARUWA", "PUTTALAM", "RATNAPURA",
  "TRINCOMALEE", "VAUNIYA"
];

const JOB_CATEGORIES = [
  "CASHIER", "SALESMEN", "RETAIL", "TUTORING", "CATERING", "EVENT_BASED",
  "FOOD_AND_BEVERAGE", "DELIVERY", "MASCOT_DANCER", "SUPERVISOR", "KITCHEN_HELPER",
  "STORE_HELPER", "ANNOUNCER", "LEAFLET_DISTRIBUTOR", "TYPING", "DATA_ENTRY",
  "WEB_DEVELOPER", "OTHER"
];

export default function JobCreationForm() {
  const [formData, setFormData] = useState({
    jobDescription: "",
    jobTitle: "",
    jobCategory: "",
    jobPayment: "",
    requiredWorkers: "",
    requiredGender: "",
    locations: []
  });

  const [submittedData, setSubmittedData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGenderChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, requiredGender: value === "BOTH" ? ["MALE", "FEMALE"] : [value] });
  };

  const addLocation = () => {
    if (formData.locations.length < LOCATIONS.length) {
      setFormData({
        ...formData,
        locations: [...formData.locations, { location: "", startDate: "", endDate: "" }]
      });
    }
  };

  const removeLocation = (index) => {
    const updatedLocations = [...formData.locations];
    updatedLocations.splice(index, 1);
    setFormData({ ...formData, locations: updatedLocations });
  };

  const updateLocation = (index, key, value) => {
    const updatedLocations = [...formData.locations];
    updatedLocations[index][key] = value;
    setFormData({ ...formData, locations: updatedLocations });
  };

  const validateDates = () => {
    const today = new Date().toISOString().split("T")[0];
    return formData.locations.every(loc =>
      loc.startDate >= today && loc.endDate >= today && loc.endDate >= loc.startDate
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateDates()) {
      alert("Invalid date selection. Please check the start and end dates for each location.");
      return;
    }
    setSubmittedData(formData);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-md rounded-md w-full sm:w-7/10">
      <h2 className="text-2xl font-bold mb-4 text-center">Create a Job</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Job Title */}
        <div>
          <label className="block text-gray-700">Job Title</label>
          <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} className="w-full p-2 border rounded-md" required />
        </div>

        {/* Job Description */}
        <div className="mb-4">
          <label className="block text-gray-700">Job Description</label>
          <textarea name="jobDescription" value={formData.jobDescription} onChange={handleChange} className="w-full p-2 border rounded-md" required />
        </div>

        {/* Job Category */}
        <div>
          <label className="block text-gray-700">Job Category</label>
          <select name="jobCategory" value={formData.jobCategory} onChange={handleChange} className="w-full p-2 border rounded-md" required>
            <option value="">Select Category</option>
            {JOB_CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}
          </select>
        </div>

        {/* Job Payment & Required Workers (Side by Side) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700">Job Payment</label>
            <input type="number" name="jobPayment" value={formData.jobPayment} onChange={handleChange} className="w-full p-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-gray-700">Required Workers</label>
            <input type="number" name="requiredWorkers" value={formData.requiredWorkers} onChange={handleChange} className="w-full p-2 border rounded-md" required />
          </div>
        </div>

        {/* Required Gender */}
        <div>
          <label className="block text-gray-700">Required Gender</label>
          <select name="requiredGender" onChange={handleGenderChange} className="w-full p-2 border rounded-md" required>
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="BOTH">Both (Male & Female)</option>
          </select>
        </div>

        {/* Locations */}
        <div>
          <label className="block text-gray-700">Job Locations & Dates</label>
          {formData.locations.map((loc, index) => (
            <div key={index} className="border p-3 rounded-md mb-3">
              <select value={loc.location} onChange={(e) => updateLocation(index, "location", e.target.value)} className="w-full p-2 border rounded-md mb-2">
                <option value="">Select Location</option>
                {LOCATIONS.map(location => <option key={location} value={location}>{location}</option>)}
              </select>

              <label className="block text-gray-700">Start Date</label>
              <input type="date" value={loc.startDate} onChange={(e) => updateLocation(index, "startDate", e.target.value)} className="w-full p-2 border rounded-md mb-2" required />

              <label className="block text-gray-700">End Date</label>
              <input type="date" value={loc.endDate} onChange={(e) => updateLocation(index, "endDate", e.target.value)} className="w-full p-2 border rounded-md mb-2" required />

              <button type="button" onClick={() => removeLocation(index)} className="bg-red-500 text-white px-3 py-2 rounded-md w-full">🗑 Remove Location</button>
            </div>
          ))}
          <button type="button" onClick={addLocation} className="bg-blue-500 text-white px-3 py-2 rounded-md w-full mt-2">➕ Add Location</button>
        </div>

        {/* Submit Button */}
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-md w-full">Submit Job</button>
      </form>

      {/* Display Submitted Data */}
      {submittedData && (
        <div className="mt-6 p-4 bg-gray-100 rounded-md">
          <h3 className="text-xl font-semibold mb-2">Job Preview</h3>
          <pre className="text-sm bg-white p-3 rounded-md">{JSON.stringify(submittedData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
