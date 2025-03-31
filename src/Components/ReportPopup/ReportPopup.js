import React, { useState, useEffect } from "react";
import axios from "axios";

const ReportPopup = ({ isOpen, onClose, reportedUserId, currentUserId }) => {
  const [reportType, setReportType] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const maxChars = 500;

  // Reset form when popup closes
  useEffect(() => {
    if (!isOpen) {
      setReportType("");
      setFeedback("");
      setError(null);
      setSuccess(null);
      setCharCount(0);
    }
  }, [isOpen]);

  const reportTypes = [
    'Harassment_and_Safety_Issues',
    'Fraud_and_Payment_Issues',
    'Inappropriate_Content',
    'Identity_Misrepresentation',
    'Job_Misrepresentation',
    'Professional_Conduct_Issues',
    'Work_Environment_Concerns',
    'Other'
  ];

  const handleFeedbackChange = (e) => {
    const text = e.target.value;
    if (text.length <= maxChars) {
      setFeedback(text);
      setCharCount(text.length);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reportType) {
      setError("Please select a report type to continue");
      return;
    }
    
    if (!feedback.trim()) {
      setError("Please provide details about the issue you're reporting");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8100/api/v1/report/submit",
        {
          reporter: currentUserId,
          reportedUser: reportedUserId,
          reportType: reportType,
          feedback: feedback
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      if (response.data.code === 201) {
        setSuccess("Your report has been submitted successfully. Thank you for helping keep our community safe.");
        setReportType("");
        setFeedback("");
        setCharCount(0);
        setTimeout(() => {
          onClose();
          setSuccess(null);
        }, 3000);
      } else {
        setError(response.data.message || "We couldn't submit your report. Please try again later.");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Please sign in again to submit your report.");
      } else if (err.response?.status === 429) {
        setError("You've submitted too many reports recently. Please try again later.");
      } else if(err.response?.status === 404){
        setError(err.response.data.message);
      }else {
        setError("We couldn't connect to our servers. Please check your internet connection and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal when clicking outside or pressing Escape
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out"
      onClick={handleBackdropClick}
    >
      <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 shadow-xl transition-all duration-300 transform">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Report Issue</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md flex items-start">
            <svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md flex items-start">
            <svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{success}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="reportType">
              Report Type <span className="text-red-500">*</span>
            </label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-all duration-200 outline-none"
              required
            >
              <option value="">Select a report type</option>
              {reportTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="feedback">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={handleFeedbackChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-all duration-200 outline-none h-32"
              placeholder="Please provide specific details about the issue you're reporting..."
              required
            />
            <div className="mt-1 text-sm text-gray-500 flex justify-end">
              <span className={charCount > maxChars * 0.8 ? "text-orange-500" : ""}>
                {charCount}/{maxChars} characters
              </span>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 italic">
            Your report will be reviewed by our team and appropriate action will be taken. Thank you for helping maintain a safe environment.
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-center ${isSubmitting ? "opacity-80 cursor-not-allowed" : ""}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportPopup;