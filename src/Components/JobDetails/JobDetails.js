import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import ReportPopup from "../ReportPopup/ReportPopup";

const baseUrl = window._env_.BASE_URL;
const JobDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [job, setJob] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApplySection, setShowApplySection] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [appliedUsers, setAppliedUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [followingStudents, setFollowingStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [showTeamMembersPopup, setShowTeamMembersPopup] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLeader, setTeamLeader] = useState(null);
  
  const pageSize = 10;

  useEffect(() => {
    fetchJobDetails();
    fetchCurrentUserAndApplicationStatus();
  }, []);

  useEffect(() => {
    if (showPopup) {
      fetchFollowingStudents();
    }
  }, [currentPage, showPopup]);

  const fetchJobDetails = async () => {
    try {
      const jobId = searchParams.get("jobId");
      if (!jobId) {
        setError("No Job ID Provided");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication Token Not Found");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${baseUrl}/api/v1/jobs/getjob/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      //console.log("Raw Job Response:", JSON.stringify(response.data, null, 2)); // Debug

      if (response.data.code === 200) {
        const jobData = response.data.data;
        
        // Get user ID for application check
        let userId = null;
        try {
          const decodedToken = jwtDecode(token);
          userId = decodedToken.user_id;
        } catch (err) {
          console.warn("Error decoding token:", err.message);
        }

        // Check if the job status is CANCEL, immediately reject
        if (jobData.jobStatus === "CANCEL") {
          setError("Job Has Been Cancelled");
          setLoading(false);
          return;
        }
        
        // For non-PENDING jobs, check if the user has applied
        if (jobData.jobStatus !== "PENDING" && userId) {
          try {
            const applicationResponse = await axios.get(
              `${baseUrl}/api/v1/application/has-applied?studentId=${userId}&jobId=${jobId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            
            // Allow access if the user has applied, regardless of job status
            if (applicationResponse.data.code === 200 && 
                applicationResponse.data.data && 
                applicationResponse.data.data.hasApplied) {
              // Set application status
              setApplicationStatus(applicationResponse.data.data);
            } else if (jobData.jobStatus !== "PENDING") {
              // If job not PENDING and user has not applied, show appropriate message
              setError(`This job is currently ${jobData.jobStatus}`);
              setLoading(false);
              return;
            }
          } catch (err) {
            console.warn("Error checking application status:", err.message);
            // If we can't check application status and job is not PENDING, default to error
            if (jobData.jobStatus !== "PENDING") {
              setError(`Job Not Active (${jobData.jobStatus})`);
              setLoading(false);
              return;
            }
          }
        }
        
        setJob(jobData);

        // Always fetch profile picture using employer.userId
        if (jobData.employer?.userId) {
          console.log(`Fetching profile picture for userId: ${jobData.employer}`);
          fetchProfilePicture(jobData.employer, token);
        } else {
          console.warn("No employer.userId found in job data");
          setProfilePictureUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(user.companyName)}&background=random`);
        }
      } else {
        setError(response.data.message || "Failed to Fetch Job Details");
      }
    } catch (err) {
      setError("Error Fetching Job Details: " + err.message);
      console.error("Fetch job error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfilePicture = async (user, token) => {
    try {
      if (!user.userId) {
        console.warn("No userId provided for profile picture fetch");
        setProfilePictureUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(user.companyName)}&background=random`);
        return;
      }

      const response = await axios.get(
        `${baseUrl}/api/user/${user.userId}/profile-picture`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      //console.log(`Profile Picture Response for user ${user.userId}:`, response.data); // Debug

      if (response.data.code === 200 && response.data.data) {
        setProfilePictureUrl(response.data.data); // Set S3 URL
      } else {
        console.warn("Invalid profile picture response:", response.data);
        setProfilePictureUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(user.companyName)}&background=random`);
      }
    } catch (err) {
      console.error("Error Fetching Profile Picture:", err);
      setProfilePictureUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(user.companyName)}&background=random`);
    }
  };

  const fetchCurrentUserAndApplicationStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication Token Not Found");
        return;
      }

      const decodedToken = jwtDecode(token);
      const userId = decodedToken.user_id;

      const userResponse = await axios.get(
        `${baseUrl}/api/user/get-user-by-id/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (userResponse.data.code === 200 && userResponse.data.data) {
        setCurrentUser(userResponse.data.data);
      } else {
        setError(userResponse.data.message || "Failed to Fetch User Data");
        return;
      }

      const jobId = searchParams.get("jobId");
      if (jobId) {
        try {
          const applicationResponse = await axios.get(
            `${baseUrl}/api/v1/application/has-applied?studentId=${userId}&jobId=${jobId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (applicationResponse.data.code === 200 && applicationResponse.data.data) {
            setApplicationStatus(applicationResponse.data.data);
          } else {
            console.warn("Application status fetch failed:", applicationResponse.data.message || "Unknown error");
          }
        } catch (err) {
          console.warn("Error fetching application status:", err.message);
        }
      }
    } catch (err) {
      setError("Error Fetching User Data: " + err.message);
    }
  };

  const fetchFollowingStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication Token Not Found");
        return;
      }

      const decodedToken = jwtDecode(token);
      const userId = decodedToken.user_id;

      const response = await axios.get(
        `${baseUrl}/follows/${userId}/followingstudents?page=${currentPage}&size=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.code === 200 && response.data.data) {
        setFollowingStudents(response.data.data);
        setHasMore(response.data.data.length === pageSize);
      } else {
        setError(response.data.message || "Failed to Fetch Following Students");
      }
    } catch (err) {
      setError("Error Fetching Following Students: " + err.message);
    }
  };

  const handleApplyClick = () => {
    if (currentUser && job.requiredGender && !job.requiredGender.includes(currentUser.gender)) {
      setErrorMessage({ header: "Gender Mismatch Error", message: "Your gender does not match the job's required gender." });
      return;
    }
    setShowApplySection(true);
    if (currentUser && !appliedUsers.some(user => user.userId === currentUser.userId)) {
      setAppliedUsers([...appliedUsers, currentUser]);
    }
  };

  const handleRemoveUser = (userId) => {
    setAppliedUsers(appliedUsers.filter(user => user.userId !== userId));
  };

  const handleAddMember = () => {
    setShowPopup(true);
    setCurrentPage(0);
  };

  const handleAddStudent = (student) => {
    if (appliedUsers.length >= job.requiredWorkers) {
      setErrorMessage({ header: "Member Limit Exceeded", message: `Cannot add more members. Maximum limit is ${job.requiredWorkers}.` });
      return;
    }
    if (job.requiredGender && !job.requiredGender.includes(student.gender)) {
      setErrorMessage({ header: "Gender Mismatch Error", message: `The gender of ${student.userName} does not match the job's required gender.` });
      return;
    }
    if (!appliedUsers.some(user => user.userId === student.userId)) {
      setAppliedUsers([...appliedUsers, { ...student, displayName: student.userName }]);
    }
  };

  const checkApplicationStatus = async (userId) => {
    const token = localStorage.getItem("token");
    const jobId = searchParams.get("jobId");
    try {
      const response = await axios.get(
        `${baseUrl}/api/v1/application/has-applied?studentId=${userId}&jobId=${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data?.data?.hasApplied ?? false;
    } catch (err) {
      console.warn("Error checking application status:", err.message);
      return false;
    }
  };

  const handleApply = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage({ header: "Authentication Error", message: "No authentication token found." });
      return;
    }

    const jobId = searchParams.get("jobId");
    if (!jobId) {
      setErrorMessage({ header: "Job ID Error", message: "No job ID provided." });
      return;
    }

    let hasApplied = false;
    if (job.requiredWorkers === 1) {
      hasApplied = await checkApplicationStatus(currentUser.userId);
      if (hasApplied) {
        setErrorMessage({ header: "Application Error", message: "You have already applied for this job." });
        return;
      }
    } else if (job.requiredWorkers > 1) {
      const appliedPromises = appliedUsers.map(user => checkApplicationStatus(user.userId));
      const appliedStatuses = await Promise.all(appliedPromises);
      if (appliedStatuses.includes(true)) {
        setErrorMessage({ header: "Application Error", message: "One or more members have already applied for this job." });
        return;
      }
    }

    try {
      if (job.requiredWorkers === 1 && appliedUsers.length === 1) {
        const studentId = currentUser.userId;
        const response = await axios.post(
          `${baseUrl}/api/v1/application/apply/student?studentId=${studentId}&jobId=${jobId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.code === 201) {
          setSuccessMessage({ header: "Application Success", message: "Job application success!" });
          setApplicationStatus({ hasApplied: true, application: { status: "PENDING", applicationId: response.data.data.applicationId, jobId, studentId } });
          setShowApplySection(false);
        } else {
          setErrorMessage({ header: "Application Error", message: response.data.message || "Failed to apply for the job." });
        }
      } else if (job.requiredWorkers > 1 && appliedUsers.length === job.requiredWorkers) {
        if (!teamName.trim()) {
          setErrorMessage({ header: "Team Name Error", message: "Please provide a team name." });
          return;
        }

        const createTeamResponse = await axios.post(
          `${baseUrl}/api/teams/create`,
          {
            teamName: teamName.trim(),
            leader: currentUser.userId,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (createTeamResponse.data.code !== 201) {
          setErrorMessage({ header: "Team Creation Error", message: createTeamResponse.data.message || "Failed to create team." });
          return;
        }
        const teamId = createTeamResponse.data.data;

        for (const member of appliedUsers) {
          if (member.userId !== currentUser.userId) {
            const addMemberResponse = await axios.post(
              `${baseUrl}/api/teams/${teamId}/add-member/${member.userId}`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (addMemberResponse.data.code !== 200) {
              setErrorMessage({ header: "Member Addition Error", message: `Failed to add member ${member.userName}: ${addMemberResponse.data.message}` });
              return;
            }
          }
        }

        const applyTeamResponse = await axios.post(
          `${baseUrl}/api/v1/application/apply/team?teamId=${teamId}&jobId=${jobId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (applyTeamResponse.data.code === 201) {
          setSuccessMessage({ header: "Application Success", message: "Job application success!" });
          setApplicationStatus({ hasApplied: true, application: { status: "PENDING", teamId, applicationId: applyTeamResponse.data.data.applicationId }, isTeamLeader: true });
          setShowApplySection(false);
        } else {
          setErrorMessage({ header: "Application Error", message: applyTeamResponse.data.message || "Failed to apply as a team." });
        }
      } else {
        setErrorMessage({ header: "Member Count Error", message: `Please add exactly ${job.requiredWorkers} members to apply.` });
      }
    } catch (err) {
      setErrorMessage({ header: "Application Error", message: "Error applying for the job: " + err.message });
    }
  };

  const handleConfirmJob = async () => {
    const token = localStorage.getItem("token");
    const applicationId = applicationStatus?.application?.applicationId;

    if (!applicationId) {
      setErrorMessage({ header: "Confirmation Error", message: "No application ID found." });
      return;
    }

    try {
      const response = await axios.put(
        `${baseUrl}/api/student/applications/confirm?applicationId=${applicationId}&studentId=${currentUser.userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept": "*/*",
          },
        }
      );

      if (response.data.code === 200) {
        setApplicationStatus({ ...applicationStatus, application: { ...applicationStatus.application, status: "CONFIRMED" } });
        setSuccessMessage({ header: "Confirmation Success", message: "Job confirmed successfully!" });
      } else {
        setErrorMessage({ header: "Confirmation Error", message: response.data.message || "Failed to confirm job." });
      }
    } catch (err) {
      setErrorMessage({ header: "Confirmation Error", message: "Error confirming job: " + err.message });
    }
  };

  const handleConfirmGroup = async () => {
    const token = localStorage.getItem("token");
    const teamId = applicationStatus?.application?.teamId;

    if (!teamId) {
      setErrorMessage({ header: "Group Confirmation Error", message: "No team ID found." });
      return;
    }

    try {
      const response = await axios.put(
        `${baseUrl}/api/teams/${currentUser.userId}/confirm/${teamId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept": "*/*",
          },
        }
      );

      if (response.data.code === 200) {
        setApplicationStatus({ ...applicationStatus, memberStatus: true });
        setSuccessMessage({ header: "Group Confirmation Success", message: "Group confirmed successfully!" });
      } else {
        setErrorMessage({ header: "Group Confirmation Error", message: response.data.message || "Failed to confirm group." });
      }
    } catch (err) {
      setErrorMessage({ header: "Group Confirmation Error", message: "Error confirming group: " + err.message });
    }
  };

  // Add this function to handle fetching and showing team members
  const handleShowTeamMembers = async (teamId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage({ header: "Authentication Error", message: "No authentication token found." });
        return;
      }

      const response = await axios.get(
        `${baseUrl}/api/teams/${teamId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.code === 200) {
        setTeamMembers(response.data.data.members);
        setTeamLeader(response.data.data.leader);
        setTeamName(response.data.data.teamName);
        setShowTeamMembersPopup(true);
      } else {
        setErrorMessage({ header: "Team Error", message: response.data.message || "Failed to fetch team members." });
      }
    } catch (err) {
      setErrorMessage({ header: "Team Error", message: "Error fetching team members: " + err.message });
    }
  } ;

  const closePopup = () => {
    setShowPopup(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-xl font-semibold text-red-600 mb-2">Error</p>
          <p className="text-gray-600">{error}</p>
          <button 
            className="mt-6 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!job) return null;

  const renderApplyButton = () => {
    if (!applicationStatus || !applicationStatus.hasApplied) {
      return (
        <button
          onClick={handleApplyClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition duration-200 transform hover:scale-105 flex items-center justify-center w-full sm:w-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Apply Now
        </button>
      );
    }

    const { status } = applicationStatus.application;
    const isTeamJob = job.requiredWorkers > 1;

    if (isTeamJob) {
      if (status === "INACTIVE" && !applicationStatus.memberStatus) {
        return (
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              className="bg-gray-400 text-white px-6 py-3 rounded-lg font-medium opacity-75 w-full sm:w-auto cursor-not-allowed flex items-center justify-center"
              disabled
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Applied
            </button>
            <button
              onClick={() => handleShowTeamMembers(applicationStatus.application.teamId)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition duration-200 w-full sm:w-auto flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Team Members
            </button>
            <button
              onClick={handleConfirmGroup}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition duration-200 w-full sm:w-auto flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Confirm Group
            </button>
          </div>
        );
      }
      if (status === "INACTIVE" && applicationStatus.memberStatus) {
        return (
          <div>
            <button
            className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-medium opacity-90 w-full sm:w-auto cursor-not-allowed flex items-center justify-center"
            disabled
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Applied - Pending</p>
            </button>
            <div className="flex items-center mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'red' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600">Other members should confirm</p>
            </div>
          </div>
          
        );
      }
      if (status === "PENDING") {
        return (
          <button
            className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-medium opacity-90 w-full sm:w-auto cursor-not-allowed flex items-center justify-center"
            disabled
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Application Pending
          </button>
        );
      }
      if (status === "CONFIRMED") {
        return (
          <button
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium w-full sm:w-auto cursor-not-allowed flex items-center justify-center"
            disabled
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            CONFIRMED
          </button>
        );
      }
      if (status === "REJECTED") {
        return (
          <button
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium w-full sm:w-auto cursor-not-allowed flex items-center justify-center"
            disabled
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            REJECTED
          </button>
        );
      }
      if (status === "ACCEPTED" && applicationStatus.isTeamLeader) {
        return (
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-medium opacity-90 w-full sm:w-auto cursor-not-allowed flex items-center justify-center"
              disabled
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ACCEPTED
            </button>
            <button
              onClick={handleConfirmJob}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition duration-200 w-full sm:w-auto flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Confirm Job
            </button>
          </div>
        );
      }
      if (status === "ACCEPTED" && !applicationStatus.isTeamLeader) {
        return (
          <div>
            <button
            className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-medium opacity-90 w-full sm:w-auto cursor-not-allowed flex items-center justify-center"
            disabled
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ACCEPTED
            </button>
            <div className="flex items-center mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'red' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600">Waiting for team leader confirmation</p>
            </div>
          </div>
          
        );
      }
    } else {
      if (status === "PENDING") {
        return (
          <button
            className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-medium opacity-90 w-full sm:w-auto cursor-not-allowed flex items-center justify-center"
            disabled
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Application Pending
          </button>
        );
      }
      if (status === "ACCEPTED") {
        return (
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-medium opacity-90 w-full sm:w-auto cursor-not-allowed flex items-center justify-center"
              disabled
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ACCEPTED
            </button>
            <button
              onClick={handleConfirmJob}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition duration-200 w-full sm:w-auto flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Confirm Job
            </button>
          </div>
        );
      }
      if (status === "CONFIRMED") {
        return (
          <button
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium w-full sm:w-auto cursor-not-allowed flex items-center justify-center"
            disabled
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            CONFIRMED
          </button>
        );
      }
      if (status === "REJECTED") {
        return (
          <button
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium w-full sm:w-auto cursor-not-allowed flex items-center justify-center"
            disabled
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            REJECTED
          </button>
        );
      }
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Hero section remains unchanged */}
      <div
        className="relative h-[60vh] bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/40 backdrop-blur-[1px]">
          <div className="max-w-7xl mx-auto h-full flex flex-col justify-end pb-24 px-4 sm:px-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-md mt-20">
              Find Your Perfect <br />
              <span className="text-blue-400 drop-shadow-lg">Part-Time</span> Job
            </h1>
            <p className="mt-3 text-white/90 text-lg sm:text-xl max-w-2xl drop-shadow-sm">
              {job.jobTitle && `Details about ${job.jobTitle}`}
            </p>
          </div>
        </div>
      </div>

      {/* Improved Job Details Section */}
      <section className="max-w-4xl mx-auto p-4 sm:p-6 relative -mt-6 z-10">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg flex flex-col relative mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4">
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{job.jobTitle}</h3>
                <span className="ml-3 px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
                  {job.jobStatus}
                </span>
                <button 
                  className="ml-3 text-red-500 hover:text-red-700 transition-colors"
                  onClick={() => setShowReportPopup(true)}
                  title="Report this job"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </button>
              </div>
              <p 
                className="text-blue-600 font-semibold text-sm sm:text-base mt-1 cursor-pointer hover:underline flex items-center"
                onClick={() => navigate(`/e-profile?userId=${job.employer.userId}`)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {job.employer.companyName}
              </p>
            </div>
            <div className="w-20 h-20 sm:w-24 sm:h-24 mt-4 sm:mt-0 relative">
              <img
                src={profilePictureUrl}
                alt="Company Logo"
                className="rounded-full w-full h-full object-cover border-4 border-white shadow-md"
                onError={(e) => {
                  e.target.src = DEFAULT_PROFILE_PICTURE;
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Job Details
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-y-2">
                    <div className="text-gray-600 font-medium">Category:</div>
                    <div>{job.jobCategory}</div>
                    
                    <div className="text-gray-600 font-medium">Date:</div>
                    <div>
                      {new Date(job.startDate).toLocaleDateString()} - {new Date(job.endDate).toLocaleDateString()}
                    </div>
                    
                    <div className="text-gray-600 font-medium">Time:</div>
                    <div>{job.startTime} - {job.endTime}</div>
                    
                    <div className="text-gray-600 font-medium">Gender:</div>
                    <div>{job.requiredGender.join(", ")}</div>
                    
                    <div className="text-gray-600 font-medium">Workers:</div>
                    <div>{job.requiredWorkers}</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Locations
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {job.jobLocations.map((loc, index) => (
                      <li key={index} className="text-sm">{loc}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Description
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 text-sm">{job.jobDescription}</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Payment
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-green-600 font-bold text-lg">Rs. {job.jobPayment.toLocaleString()}.00</p>
                </div>
              </div>
            </div>
          </div>

          {!showApplySection && (
            <div className="flex flex-col sm:flex-row sm:space-x-4 mt-6">{renderApplyButton()}</div>
          )}

          {showApplySection && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-bold mb-4">Apply</h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mb-4">
                <div className="font-bold">Name</div>
                <div className="font-bold">Action</div>
                {appliedUsers.map((user) => (
                  <React.Fragment key={user.userId}>
                    <div className="flex items-center">
                      <span>{user.displayName || user.userName}</span>
                    </div>
                    <div>
                      {user.userId !== currentUser?.userId && (
                        <button
                          onClick={() => handleRemoveUser(user.userId)}
                          className="text-red-500"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </React.Fragment>
                ))}
              </div>
              {job.requiredWorkers > 1 && (
                <>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter team name"
                    className="w-full mb-2 p-2 border rounded"
                  />
                  <button
                    onClick={handleAddMember}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center justify-center mb-2"
                  >
                    <span className="mr-2">👤</span> Add Member
                  </button>
                </>
              )}
              <button
                onClick={handleApply}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                disabled={job.requiredWorkers !== appliedUsers.length}
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </section>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Add Team Members</h3>
              <button
                onClick={closePopup}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              {followingStudents.length > 0 ? (
                followingStudents.map((student) => (
                  <div
                    key={student.userId}
                    className="flex justify-between items-center py-2 border-b"
                  >
                    <span>{student.displayName}</span>
                    <button
                      onClick={() => handleAddStudent(student)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg"
                      disabled={appliedUsers.length >= job.requiredWorkers}
                    >
                      {appliedUsers.some(user => user.userId === student.userId) ? "Added" : "Add"}
                    </button>
                  </div>
                ))
              ) : (
                <p>No available following students found</p>
              )}
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                disabled={currentPage === 0}
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span>Page {currentPage + 1}</span>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!hasMore}
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{errorMessage.header}</h3>
              <button
                onClick={closePopup}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="text-red-600">{errorMessage.message}</p>
            <button
              onClick={closePopup}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{successMessage.header}</h3>
              <button
                onClick={closePopup}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="text-green-600">{successMessage.message}</p>
            <button
              onClick={closePopup}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Report Job Popup */}
      <ReportPopup
        isOpen={showReportPopup}
        onClose={() => setShowReportPopup(false)}
        reportedUserId={job?.employer?.userId}
        currentUserId={currentUser?.userId}
      />
      {/* Team Members Popup */}
      {showTeamMembersPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Team: {teamName}</h3>
              <button
                onClick={() => setShowTeamMembersPopup(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Team Leader</h4>
              <div className="py-2 px-3 bg-blue-50 rounded-lg mb-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {teamLeader?.userName?.charAt(0) || "?"}
                  </div>
                  <span>{teamLeader?.userName || "Unknown"}</span>
                </div>
              </div>
              
              <h4 className="font-semibold mb-2">Team Members</h4>
              {teamMembers.length > 0 ? (
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div key={member.userId} className="py-2 px-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center" onClick={() => navigate(`/profile?userId=${member.userId}`)}>
                        <div className="h-8 w-8 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                          {member.userName.charAt(0)}
                        </div>
                        <span className="cursor-pointer hover:underline">{member.userName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No team members found.</p>
              )}
            </div>
            <button
              onClick={() => setShowTeamMembersPopup(false)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;