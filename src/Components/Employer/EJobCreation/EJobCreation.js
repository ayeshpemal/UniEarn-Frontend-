import { useState, useEffect } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

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

const API_URL = "http://localhost:8100/api/v1/jobs/addjob";

export default function JobCreationForm() {
  const [formData, setFormData] = useState({
    jobDescription: "",
    jobTitle: "",
    jobCategory: "",
    jobPayment: "",
    requiredWorkers: "",
    requiredGender: "",
    jobLocations: [],
    startTime: { hour: 0, minute: 0, second: 0, nano: 0 },
    endTime: { hour: 0, minute: 0, second: 0, nano: 0 },
    employer: null,
    status: true
  });

  const [errors, setErrors] = useState({});
  const [submittedData, setSubmittedData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const employerId = decoded.user_id;
        if (employerId) {
          setFormData(prev => ({ ...prev, employer: Number(employerId) }));
        } else {
          setErrors(prev => ({ ...prev, auth: "Invalid token: Employer ID not found" }));
        }
      } catch (error) {
        console.error('JWT Decode Error:', error);
        setErrors(prev => ({ ...prev, auth: "Invalid authentication token" }));
      }
    } else {
      setErrors(prev => ({ ...prev, auth: "Please login to create a job" }));
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.employer) newErrors.employer = "Employer authentication required";
    if (!formData.jobTitle.trim()) newErrors.jobTitle = "Job title is required";
    if (!formData.jobDescription.trim()) newErrors.jobDescription = "Description is required";
    if (!formData.jobCategory) newErrors.jobCategory = "Please select a category";
    if (!formData.jobPayment || formData.jobPayment <= 0) newErrors.jobPayment = "Valid payment amount required";
    if (!formData.requiredWorkers || formData.requiredWorkers <= 0) newErrors.requiredWorkers = "Number of workers required";
    if (!formData.requiredGender) newErrors.requiredGender = "Please select gender requirement";
    if (formData.startTime.hour < 0 || formData.startTime.hour > 23) newErrors.startTime = "Valid start time required";
    if (formData.endTime.hour < 0 || formData.endTime.hour > 23) newErrors.endTime = "Valid end time required";
    
    if (formData.jobLocations.length === 0) {
      newErrors.jobLocations = "At least one location is required";
    } else {
      formData.jobLocations.forEach((loc, index) => {
        if (!loc.location) newErrors[`location_${index}`] = "Location is required";
        if (!loc.startDate) newErrors[`startDate_${index}`] = "Start date is required";
        if (!loc.endDate) newErrors[`endDate_${index}`] = "End date is required";
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === "jobPayment" || name === "requiredWorkers" ? Number(value) : value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleTimeChange = (field, value) => {
    if (!value) return;
    
    const [hours, minutes] = value.split(':');
    setFormData(prev => ({
      ...prev,
      [field]: {
        hour: parseInt(hours),
        minute: parseInt(minutes),
        second: 0,
        nano: 0
      }
    }));
    setErrors({ ...errors, [field]: "" });
  };

  const formatTimeForInput = (time) => {
    return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
  };

  const formatTimeForAPI = (time) => {
    return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}:${time.second.toString().padStart(2, '0')}`;
  };

  const handleGenderChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, requiredGender: value === "BOTH" ? ["MALE", "FEMALE"] : [value] });
    setErrors({ ...errors, requiredGender: "" });
  };

  const addLocation = () => {
    if (formData.jobLocations.length < LOCATIONS.length) {
      setFormData({
        ...formData,
        jobLocations: [...formData.jobLocations, { location: "", startDate: "", endDate: "" }]
      });
    }
  };

  const removeLocation = (index) => {
    const updatedLocations = [...formData.jobLocations];
    updatedLocations.splice(index, 1);
    setFormData({ ...formData, jobLocations: updatedLocations });
    const newErrors = { ...errors };
    delete newErrors[`location_${index}`];
    delete newErrors[`startDate_${index}`];
    delete newErrors[`endDate_${index}`];
    setErrors(newErrors);
  };

  const updateLocation = (index, key, value) => {
    const updatedLocations = [...formData.jobLocations];
    updatedLocations[index][key] = value;
    setFormData({ ...formData, jobLocations: updatedLocations });
    setErrors({ ...errors, [`${key}_${index}`]: "" });
  };

  const validateDates = () => {
    const today = new Date().toISOString().split("T")[0];
    return formData.jobLocations.every(loc =>
      loc.startDate >= today && loc.endDate >= today && loc.endDate >= loc.startDate
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    if (!validateDates()) {
      setErrors({ ...errors, dateValidation: "Invalid date selection. Dates must be current or future and end date must be after start date." });
      setIsSubmitting(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setErrors({ ...errors, auth: "Authentication required" });
      setIsSubmitting(false);
      return;
    }

    // Format the data for the API
    const formattedData = {
      ...formData,
      jobLocations: formData.jobLocations.map(loc => ({
        ...loc,
        startDate: `${loc.startDate}T00:00:00`, // Fixed time 00:00:00
        endDate: `${loc.endDate}T06:00:00`      // Fixed time 06:00:00
      })),
      startTime: formatTimeForAPI(formData.startTime), // Keep original dynamic time
      endTime: formatTimeForAPI(formData.endTime),     // Keep original dynamic time
      employer: Number(formData.employer)
    };

    try {
      const response = await axios.post(API_URL, formattedData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setSubmittedData(response.data);
      setFormData({
        jobDescription: "",
        jobTitle: "",
        jobCategory: "",
        jobPayment: "",
        requiredWorkers: "",
        requiredGender: "",
        jobLocations: [],
        startTime: { hour: 0, minute: 0, second: 0, nano: 0 },
        endTime: { hour: 0, minute: 0, second: 0, nano: 0 },
        employer: formData.employer,
        status: true
      });
    } catch (error) {
      console.error('API Error:', error);
      setErrors({ 
        ...errors, 
        submit: error.response?.data?.message || "Failed to create job. Please try again." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (errors.auth) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-8">
        <div className="text-red-500 text-center">{errors.auth}</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-8">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Create a New Job</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
          <input
            type="text"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.jobTitle ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter job title"
          />
          {errors.jobTitle && <p className="text-red-500 text-sm mt-1">{errors.jobTitle}</p>}
        </div>

        {/* Job Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
          <textarea
            name="jobDescription"
            value={formData.jobDescription}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.jobDescription ? 'border-red-500' : 'border-gray-300'}`}
            rows="4"
            placeholder="Describe the job requirements..."
          />
          {errors.jobDescription && <p className="text-red-500 text-sm mt-1">{errors.jobDescription}</p>}
        </div>

        {/* Job Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Category</label>
          <select
            name="jobCategory"
            value={formData.jobCategory}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.jobCategory ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select Category</option>
            {JOB_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.jobCategory && <p className="text-red-500 text-sm mt-1">{errors.jobCategory}</p>}
        </div>

        {/* Job Payment & Required Workers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment (LKR)</label>
            <input
              type="number"
              name="jobPayment"
              value={formData.jobPayment}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.jobPayment ? 'border-red-500' : 'border-gray-300'}`}
              min="0"
              placeholder="Enter amount"
            />
            {errors.jobPayment && <p className="text-red-500 text-sm mt-1">{errors.jobPayment}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Required Workers</label>
            <input
              type="number"
              name="requiredWorkers"
              value={formData.requiredWorkers}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.requiredWorkers ? 'border-red-500' : 'border-gray-300'}`}
              min="1"
              placeholder="Number of workers"
            />
            {errors.requiredWorkers && <p className="text-red-500 text-sm mt-1">{errors.requiredWorkers}</p>}
          </div>
        </div>

        {/* Time Inputs with Clock Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              type="time"
              value={formatTimeForInput(formData.startTime)}
              onChange={(e) => handleTimeChange('startTime', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.startTime ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              type="time"
              value={formatTimeForInput(formData.endTime)}
              onChange={(e) => handleTimeChange('endTime', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.endTime ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
          </div>
        </div>

        {/* Required Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Required Gender</label>
          <select
            name="requiredGender"
            onChange={handleGenderChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.requiredGender ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="BOTH">Both (Male & Female)</option>
          </select>
          {errors.requiredGender && <p className="text-red-500 text-sm mt-1">{errors.requiredGender}</p>}
        </div>

        {/* Locations */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Locations & Dates</label>
          {formData.jobLocations.map((loc, index) => (
            <div key={index} className="border p-4 rounded-lg mb-4 bg-gray-50">
              <div className="space-y-4">
                <div>
                  <select
                    value={loc.location}
                    onChange={(e) => updateLocation(index, "location", e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[`location_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select Location</option>
                    {LOCATIONS.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                  {errors[`location_${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`location_${index}`]}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={loc.startDate}
                      onChange={(e) => updateLocation(index, "startDate", e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[`startDate_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors[`startDate_${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`startDate_${index}`]}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">End Date</label>
                    <input
                      type="date"
                      value={loc.endDate}
                      onChange={(e) => updateLocation(index, "endDate", e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[`endDate_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors[`endDate_${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`endDate_${index}`]}</p>}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeLocation(index)}
                className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <FaTrash className="w-4 h-4" />
                <span>Remove Location</span>
              </button>
            </div>
          ))}
          {errors.jobLocations && <p className="text-red-500 text-sm mb-2">{errors.jobLocations}</p>}
          {errors.dateValidation && <p className="text-red-500 text-sm mb-2">{errors.dateValidation}</p>}
          <button
            type="button"
            onClick={addLocation}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            disabled={formData.jobLocations.length >= LOCATIONS.length}
          >
            <FaPlus className="w-4 h-4" />
            <span>Add Location</span>
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !formData.employer}
          className={`w-full bg-green-500 text-white px-4 py-3 rounded-lg transition-colors duration-200 ${
            (isSubmitting || !formData.employer) ? 'opacity-75 cursor-not-allowed' : 'hover:bg-green-600'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Create Job'}
        </button>

        {errors.submit && <p className="text-red-500 text-sm text-center">{errors.submit}</p>}
      </form>

      {/* Display Submitted Data */}
      {submittedData && (
        <div className="mt-8 p-6 bg-gray-100 rounded-xl">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Job Created Successfully!</h3>
          <pre className="text-sm bg-white p-4 rounded-lg overflow-auto max-h-96">
            {JSON.stringify(submittedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}