import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const DEFAULT_PROFILE_PICTURE = "/job-logo.png"; // Default image path

const JobDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [job, setJob] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(DEFAULT_PROFILE_PICTURE);
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
  const pageSize = 10;

  useEffect(() => {
    fetchJobDetails();
    fetchCurrentUser();
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

      const response = await fetch(
        `http://localhost:8100/api/v1/jobs/getjob/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.code === 200) {
        const jobData = data.data;
        if (!jobData.activeStatus) {
          setError("Job Not Active");
          setLoading(false);
          return;
        }
        setJob(jobData);
        if (jobData.employer.profilePictureUrl) {
          fetchProfilePicture(jobData.employer.userId, token);
        }
      } else {
        setError(data.message || "Failed to Fetch Job Details");
      }
    } catch (err) {
      setError("Error Fetching Job Details: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfilePicture = async (userId, token) => {
    try {
      if (!userId) {
        setProfilePictureUrl(DEFAULT_PROFILE_PICTURE);
        return;
      }

      const response = await fetch(
        `http://localhost:8100/api/user/${userId}/profile-picture`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.code === 200 && data.data) {
        setProfilePictureUrl(data.data);
      } else {
        setProfilePictureUrl(DEFAULT_PROFILE_PICTURE);
      }
    } catch (err) {
      console.error("Error Fetching Profile Picture:", err);
      setProfilePictureUrl(DEFAULT_PROFILE_PICTURE);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication Token Not Found");
        return;
      }

      const decodedToken = jwtDecode(token);
      const userId = decodedToken.user_id;

      const response = await fetch(
        `http://localhost:8100/api/user/get-user-by-id/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.code === 200 && data.data) {
        setCurrentUser(data.data);
      } else {
        setError(data.message || "Failed to Fetch User Data");
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

      const response = await fetch(
        `http://localhost:8100/follows/${userId}/followingstudents?page=${currentPage}&size=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.code === 200 && data.data) {
        setFollowingStudents(data.data);
        setHasMore(data.data.length === pageSize);
      } else {
        setError(data.message || "Failed to Fetch Following Students");
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
    const response = await fetch(
      `http://localhost:8100/api/v1/application/has-applied?studentId=${userId}&jobId=${jobId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    return data.data; // Returns true if applied, false if not
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

    // Check if user(s) have already applied
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
        const response = await fetch(
          `http://localhost:8100/api/v1/application/apply/student?studentId=${studentId}&jobId=${jobId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        if (data.code === 200) {
          setSuccessMessage({ header: "Application Success", message: "Job application success!" });
        } else {
          setErrorMessage({ header: "Application Error", message: data.message || "Failed to apply for the job." });
        }
      } else if (job.requiredWorkers > 1 && appliedUsers.length === job.requiredWorkers) {
        if (!teamName.trim()) {
          setErrorMessage({ header: "Team Name Error", message: "Please provide a team name." });
          return;
        }

        // Create team
        const createTeamResponse = await fetch(
          `http://localhost:8100/api/teams/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              teamName: teamName.trim(),
              leader: currentUser.userId,
            }),
          }
        );

        const teamData = await createTeamResponse.json();
        if (teamData.code !== 201) {
          setErrorMessage({ header: "Team Creation Error", message: teamData.message || "Failed to create team." });
          return;
        }
        const teamId = teamData.data; // Extract teamId from data (e.g., 3)

        // Add members to team
        for (const member of appliedUsers) {
          if (member.userId !== currentUser.userId) {
            const addMemberResponse = await fetch(
              `http://localhost:8100/api/teams/${teamId}/add-member/${member.userId}`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const addMemberData = await addMemberResponse.json();
            if (addMemberData.code !== 200) {
              setErrorMessage({ header: "Member Addition Error", message: `Failed to add member ${member.userName}: ${addMemberData.message}` });
              return;
            }
          }
        }

        // Apply as team
        const applyTeamResponse = await fetch(
          `http://localhost:8100/api/v1/application/apply/team?teamId=${teamId}&jobId=${jobId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const applyTeamData = await applyTeamResponse.json();
        if (applyTeamData.code === 201) {
          setSuccessMessage({ header: "Application Success", message: "Job application success!" });
        } else {
          setErrorMessage({ header: "Application Error", message: applyTeamData.message || "Failed to apply as a team." });
        }
      } else {
        setErrorMessage({ header: "Member Count Error", message: `Please add exactly ${job.requiredWorkers} members to apply.` });
      }
    } catch (err) {
      setErrorMessage({ header: "Application Error", message: "Error applying for the job: " + err.message });
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Hero Section */}
      <header
        className="relative flex flex-col justify-center items-center text-white h-[50vh] sm:h-[70vh] bg-cover bg-center px-4 sm:px-6"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="relative z-10 text-center">
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold">
            Find Your Perfect <br />
            <span className="text-blue-400">Part-Time</span> Job
          </h1>
        </div>
      </header>

      {/* Job Listings Section */}
      <section className="max-w-4xl mx-auto p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">
          Job Details
        </h2>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md flex flex-col relative mb-6">
          {/* Job Title and Profile Picture */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h3 className="text-lg sm:text-xl font-bold">{job.jobTitle}</h3>
            <div className="w-16 h-16 sm:w-20 sm:h-20 mt-2 sm:mt-0">
              <img
                src={profilePictureUrl}
                alt="Company Logo"
                className="rounded-full w-full h-full object-cover"
                onError={() => setProfilePictureUrl(DEFAULT_PROFILE_PICTURE)}
              />
            </div>
          </div>

          {/* Job Details */}
          <div className="flex-grow">
            <div className="mb-4">
              <p className="text-gray-600 font-semibold text-sm sm:text-base">
                {job.employer.companyName}
              </p>
              <p className="text-gray-500 text-xs sm:text-sm">
                {job.employer.companyDetails}
              </p>
              <p className="text-gray-700 text-sm sm:text-base mt-2">
                <span className="font-bold">Category:</span> {job.jobCategory} <br />
                <span className="font-bold">Description:</span> {job.jobDescription} <br />
                <span className="font-bold">Date:</span>{" "}
                {new Date(job.startDate).toLocaleDateString()} -{" "}
                {new Date(job.endDate).toLocaleDateString()} <br />
                <span className="font-bold">Time:</span> {job.startTime} -{" "}
                {job.endTime} <br />
                <span className="font-bold">Gender:</span>{" "}
                {job.requiredGender.join(", ")} <br />
                <span className="font-bold">No of Workers:</span>{" "}
                {job.requiredWorkers}
              </p>
            </div>

            <p className="text-gray-700 mt-2">
              <span className="font-bold">Locations:</span>{" "}
              {job.jobLocations.map((loc, index) => (
                <span key={index} className="block text-sm text-gray-500">
                  {loc}
                </span>
              ))}
            </p>

            {/* Salary */}
            <p className="text-green-600 font-bold mt-1 text-sm sm:text-base">
              Rs. {job.jobPayment.toLocaleString()}.00
            </p>

            {/* Apply Now Button (disappears after click) */}
            {!showApplySection && (
              <button
                onClick={handleApplyClick}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg mt-4 w-full sm:w-auto"
              >
                Apply Now
              </button>
            )}

            {/* Apply Section */}
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
        </div>
      </section>

      {/* Popup for Adding Members */}
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
                    <span>{student.userName}</span>
                    <button
                      onClick={() => handleAddStudent(student)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg"
                      disabled={appliedUsers.length >= job.requiredWorkers}
                    >
                      {appliedUsers.some(user => user.userId === student.userId)
                        ? "Added"
                        : "Add"}
                    </button>
                  </div>
                ))
              ) : (
                <p>No available following students found</p>
              )}
            </div>
            {/* Pagination */}
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

      {/* Error Popup */}
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

      {/* Success Popup */}
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
    </div>
  );
};

export default JobDetails;