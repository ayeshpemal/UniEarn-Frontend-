import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useLocation } from "react-router-dom";

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

const API_URL = "http://localhost:8100/api/v1/jobs/updatejob";

export default function JobEditForm() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const jobId = queryParams.get("jobId");

  const [formData, setFormData] = useState({
    jobId: 0,
    jobDescription: "",
    jobTitle: "",
    jobCategory: "",
    jobPayment: "",
    requiredWorkers: "",
    requiredGender: [],
    jobLocations: [{ location: "", startDate: "", endDate: "" }], // Single location object
    startTime: "00:00:00",
    endTime: "00:00:00",
    employer: null,
    status: true,
  });

  const [errors, setErrors] = useState({});
  const [submittedData, setSubmittedData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Please login to edit a job");

        const decoded = jwtDecode(token);
        const employerId = decoded.user_id;

        const response = await axios.get(`http://localhost:8100/api/v1/jobs/getjob/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const jobData = response.data.data;

        setFormData({
          jobId: jobData.jobId,
          jobDescription: jobData.jobDescription || "",
          jobTitle: jobData.jobTitle || "",
          jobCategory: jobData.jobCategory || "",
          jobPayment: jobData.jobPayment || "",
          requiredWorkers: jobData.requiredWorkers || "",
          requiredGender: jobData.requiredGender || [],
          jobLocations: [{
            location: jobData.jobLocations[0] || "", // Use first location
            startDate: jobData.startDate.split("T")[0] || "",
            endDate: jobData.endDate.split("T")[0] || "",
          }],
          startTime: jobData.startTime || "00:00:00",
          endTime: jobData.endTime || "00:00:00",
          employer: employerId,
          status: jobData.activeStatus,
        });
      } catch (error) {
        console.error("Error fetching job details:", error);
        setErrors({ ...errors, fetch: "Failed to load job details" });
      } finally {
        setLoading(false);
      }
    };

    if (jobId) fetchJobDetails();
  }, [jobId]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.employer) newErrors.employer = "Employer authentication required";
    if (!formData.jobTitle.trim()) newErrors.jobTitle = "Job title is required";
    if (!formData.jobDescription.trim()) newErrors.jobDescription = "Description is required";
    if (!formData.jobCategory) newErrors.jobCategory = "Please select a category";
    if (!formData.jobPayment || formData.jobPayment <= 0) newErrors.jobPayment = "Valid payment amount required";
    if (!formData.requiredWorkers || formData.requiredWorkers <= 0) newErrors.requiredWorkers = "Number of workers required";
    if (!formData.requiredGender.length) newErrors.requiredGender = "Please select gender requirement";
    if (!formData.startTime || !/^\d{2}:\d{2}:\d{2}$/.test(formData.startTime)) newErrors.startTime = "Valid start time required (HH:mm:ss)";
    if (!formData.endTime || !/^\d{2}:\d{2}:\d{2}$/.test(formData.endTime)) newErrors.endTime = "Valid end time required (HH:mm:ss)";
    if (!formData.jobLocations[0].location) newErrors.location = "Location is required";
    if (!formData.jobLocations[0].startDate) newErrors.startDate = "Start date is required";
    if (!formData.jobLocations[0].endDate) newErrors.endDate = "End date is required";
    
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
    const [hours, minutes] = value.split(":");
    const formattedTime = `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00`;
    setFormData(prev => ({ ...prev, [field]: formattedTime }));
    setErrors({ ...errors, [field]: "" });
  };

  const formatTimeForInput = (timeString) => timeString.slice(0, 5);

  const handleGenderChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, requiredGender: value === "BOTH" ? ["MALE", "FEMALE"] : [value] });
    setErrors({ ...errors, requiredGender: "" });
  };

  const updateLocation = (key, value) => {
    setFormData(prev => ({
      ...prev,
      jobLocations: [{ ...prev.jobLocations[0], [key]: value }]
    }));
    setErrors({ ...errors, [key]: "" });
  };

  const validateDates = () => {
    const today = new Date().toISOString().split("T")[0];
    const loc = formData.jobLocations[0];
    return loc.startDate >= today && loc.endDate >= today && loc.endDate >= loc.startDate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    if (!validateDates()) {
      setErrors({ ...errors, dateValidation: "Invalid dates. Ensure dates are current/future and end date is after start date." });
      setIsSubmitting(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setErrors({ ...errors, auth: "Authentication required" });
      setIsSubmitting(false);
      return;
    }

    const formattedData = {
      jobId: formData.jobId,
      jobTitle: formData.jobTitle,
      jobCategory: formData.jobCategory,
      jobDescription: formData.jobDescription,
      jobLocations: [{
        location: formData.jobLocations[0].location,
        startDate: new Date(formData.jobLocations[0].startDate).toISOString(),
        endDate: new Date(formData.jobLocations[0].endDate).toISOString(),
      }],
      startTime: formData.startTime,
      endTime: formData.endTime,
      jobPayment: Number(formData.jobPayment),
      requiredWorkers: Number(formData.requiredWorkers),
      requiredGender: formData.requiredGender,
      employer: Number(formData.employer),
      status: formData.status,
    };

    try {
      const response = await axios.put(`${API_URL}/${jobId}`, formattedData, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      setSubmittedData(response.data);
      alert("Job updated successfully!");
    } catch (error) {
      console.error("API Error:", error);
      setErrors({ ...errors, submit: error.response?.data?.message || "Failed to update job." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center p-6">Loading job details...</div>;
  if (errors.fetch) return <div className="text-red-500 text-center p-6">{errors.fetch}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-8">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Edit Job</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
          <input
            type="text"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg ${errors.jobTitle ? "border-red-500" : "border-gray-300"}`}
            placeholder="Enter job title"
          />
          {errors.jobTitle && <p className="text-red-500 text-sm mt-1">{errors.jobTitle}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
          <textarea
            name="jobDescription"
            value={formData.jobDescription}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg ${errors.jobDescription ? "border-red-500" : "border-gray-300"}`}
            rows="4"
            placeholder="Describe the job requirements..."
          />
          {errors.jobDescription && <p className="text-red-500 text-sm mt-1">{errors.jobDescription}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Category</label>
          <select
            name="jobCategory"
            value={formData.jobCategory}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg ${errors.jobCategory ? "border-red-500" : "border-gray-300"}`}
          >
            <option value="">Select Category</option>
            {JOB_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.jobCategory && <p className="text-red-500 text-sm mt-1">{errors.jobCategory}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment (LKR)</label>
            <input
              type="number"
              name="jobPayment"
              value={formData.jobPayment}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${errors.jobPayment ? "border-red-500" : "border-gray-300"}`}
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
              className={`w-full p-3 border rounded-lg ${errors.requiredWorkers ? "border-red-500" : "border-gray-300"}`}
              min="1"
              placeholder="Number of workers"
            />
            {errors.requiredWorkers && <p className="text-red-500 text-sm mt-1">{errors.requiredWorkers}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              type="time"
              value={formatTimeForInput(formData.startTime)}
              onChange={(e) => handleTimeChange("startTime", e.target.value)}
              className={`w-full p-3 border rounded-lg ${errors.startTime ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              type="time"
              value={formatTimeForInput(formData.endTime)}
              onChange={(e) => handleTimeChange("endTime", e.target.value)}
              className={`w-full p-3 border rounded-lg ${errors.endTime ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Required Gender</label>
          <select
            name="requiredGender"
            onChange={handleGenderChange}
            value={formData.requiredGender.length === 2 ? "BOTH" : formData.requiredGender[0] || ""}
            className={`w-full p-3 border rounded-lg ${errors.requiredGender ? "border-red-500" : "border-gray-300"}`}
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="BOTH">Both (Male & Female)</option>
          </select>
          {errors.requiredGender && <p className="text-red-500 text-sm mt-1">{errors.requiredGender}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Location & Dates</label>
          <div className="border p-4 rounded-lg bg-gray-50">
            <div className="space-y-4">
              <div>
                <select
                  value={formData.jobLocations[0].location}
                  onChange={(e) => updateLocation("location", e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.location ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">Select Location</option>
                  {LOCATIONS.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.jobLocations[0].startDate}
                    onChange={(e) => updateLocation("startDate", e.target.value)}
                    className={`w-full p-3 border rounded-lg ${errors.startDate ? "border-red-500" : "border-gray-300"}`}
                  />
                  {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.jobLocations[0].endDate}
                    onChange={(e) => updateLocation("endDate", e.target.value)}
                    className={`w-full p-3 border rounded-lg ${errors.endDate ? "border-red-500" : "border-gray-300"}`}
                  />
                  {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                </div>
              </div>
            </div>
          </div>
          {errors.dateValidation && <p className="text-red-500 text-sm mt-2">{errors.dateValidation}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !formData.employer}
          className={`w-full bg-green-500 text-white px-4 py-3 rounded-lg ${isSubmitting || !formData.employer ? "opacity-75 cursor-not-allowed" : "hover:bg-green-600"}`}
        >
          {isSubmitting ? "Updating..." : "Update Job"}
        </button>

        {errors.submit && <p className="text-red-500 text-sm text-center">{errors.submit}</p>}
      </form>

      {submittedData && (
        <div className="mt-8 p-6 bg-gray-100 rounded-xl">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Job Updated Successfully!</h3>
          <pre className="text-sm bg-white p-4 rounded-lg overflow-auto max-h-96">
            {JSON.stringify(submittedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}