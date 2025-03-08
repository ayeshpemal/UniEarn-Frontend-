import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const JobDetails = () => {
    const { jobId } = useParams(); // Get jobId from URL
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [job, setJob] = useState(null); // Store job details

    useEffect(() => {
        // Fetch job details from the API using axios
        const fetchJob = async () => {
            try {
                console.log("Fetching job with ID:", jobId);
                const response = await axios.get(`http://localhost:8100/api/v1/jobs/getjob/${jobId}`);
                console.log("API Response:", response);

                const fetchedJob = response.data?.data || null;
                setJob(fetchedJob);
            } catch (err) {
                console.error("Error fetching job:", err);
                setError("Failed to fetch job details.");
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [jobId]); // Dependency array updated

    const navigate = useNavigate();
    const onNavigateToApplyJob = () => {
        navigate("/apply-job");
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
        <div className="bg-gray-100 min-h-screen">
            <section className="max-w-4xl mx-auto p-6">
                <h2 className="text-2xl font-bold mb-4 text-center">Job Details</h2>

                {/* Loading & Error Handling */}
                {loading && <p className="text-center text-gray-600">Loading job details...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}
                {!loading && !error && job ? (
                    <div key={job.jobId} className="bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row-reverse relative items-start md:items-center mb-6">
                        {/* Job Logo */}
                        <div className="absolute top-6 left-6 w-20 h-20">
                            <img src="/job-logo.png" alt="Company Logo" className="rounded-full w-full h-full" />
                        </div>

                        {/* Job Details */}
                        <div className="flex-grow ml-20 bg-white p-6 rounded-lg shadow-lg">
                            {/* Job Title & Category */}
                            <h2 className="text-2xl font-bold text-gray-800">
                                {job?.jobTitle || "No job title available"}
                                <span className="text-blue-600 text-lg"> ({job?.jobCategory || "No category"})</span>
                            </h2>
                            <p className="text-gray-600 mt-2">{job?.jobDescription || "No job description available."}</p>

                            {/* Job Information */}
                            <div className="mt-4 space-y-2">
                                <p><span className="font-semibold text-gray-700">📅 Start Date:</span> {job?.startDate || "N/A"}</p>
                                <p><span className="font-semibold text-gray-700">📅 End Date:</span> {job?.endDate || "N/A"}</p>
                                <p><span className="font-semibold text-gray-700">🧑‍🤝‍🧑 Gender:</span> {job?.requiredGender || "Any"}</p>
                                <p><span className="font-semibold text-gray-700">👥 No. of Students:</span> {job?.requiredWorkers || "N/A"}</p>
                            </div>

                            {/* Locations */}
                            <div className="mt-4">
                                <span className="font-bold text-gray-700">📍 Locations:</span>
                                {job?.jobLocations?.length > 0 ? (
                                    <ul className="list-disc list-inside text-gray-600">
                                        {job.jobLocations.map((loc, index) => (
                                            <li key={index}>{loc}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500">No locations provided</p>
                                )}
                            </div>

                            {/* Rating & Salary */}
                            <p><br/>{job?.employer?.companyName || "N/A"}</p>
                            <div className="flex items-center mt-4">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((_, index) => (
                                        <Star
                                            key={index}
                                            size={20}
                                            className={index < job.employer.rating ? "text-yellow-400" : "text-gray-300"}
                                            fill="currentColor"
                                        />
                                    ))}
                                </div>
                                <span className="ml-2 text-gray-500">{job?.reviews || "No reviews"}</span>
                            </div>

                            {/* Salary */}
                            <p className="text-green-600 font-bold text-xl mt-2">
                                💰 {job?.jobPayment || "Salary not specified"}
                            </p>

                            {/* Apply Now Button */}
                            <button
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg mt-6 hover:bg-blue-700 transition duration-300"
                                onClick={onNavigateToApplyJob}
                            >
                                Apply Now 🚀
                            </button>
                        </div>

                    </div>
                ) : (
                    !loading && !error && <p className="text-center text-gray-500">No job details found.</p>
                )}
            </section>

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