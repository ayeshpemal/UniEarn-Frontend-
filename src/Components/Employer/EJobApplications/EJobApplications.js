import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GroupTeam from "./GroupTeam";
import Student from "./Student";
import axios from "axios";

const Application = () => {
  // State variables
  const [job, setJob] = useState(null);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(5);
  
  const navigate = useNavigate(); // For navigation to profile pages
  
  // Get jobId from URL query parameters
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const jobId = queryParams.get("jobId");
  
  // Helper function to get JWT token
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Helper function to fetch profile picture URL
  const fetchProfilePicture = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:8100/api/user/${userId}/profile-picture`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );
      
      if (response.data.code === 200) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching profile picture for user ${userId}:`, error);
      return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time to show AM/PM
  const formatTimeWithAMPM = (timeString) => {
    if (!timeString) return "";
    // Parse HH:MM format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const fetchJobDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8100/api/v1/jobs/getjob/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );
      
      if (response.data.code === 200) {
        const jobData = response.data.data;
        setJob({
          id: jobData.jobId,
          title: jobData.jobTitle,
          description: jobData.jobDescription,
          date: `${formatDate(jobData.startDate)} - ${formatDate(jobData.endDate)}`,
          // Updated time format to include AM/PM
          time: `${formatTimeWithAMPM(jobData.startTime)} - ${formatTimeWithAMPM(jobData.endTime)}`,
          gender: jobData.requiredGender.join(", "),
          requiredWorkers: jobData.requiredWorkers,
          salary: `Rs.${jobData.jobPayment.toFixed(2)}`,
          companyName: jobData.employer.companyName,
          coverImage: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80",
          status: jobData.jobStatus
        });
        
        // Fetch applications based on job requirements
        if (jobData.requiredWorkers === 1) {
          fetchStudentApplications(0);
        } else {
          fetchGroupApplications(0);
        }
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
      setError("Failed to load job details.");
      setLoading(false);
    }
  };

  const fetchStudentApplications = async (page) => {
    try {
      const response = await axios.get(
        `http://localhost:8100/api/v1/application/student-applications/job/${jobId}?page=${page}&pageSize=${itemsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );
      
      if (response.data.code === 200) {
        const studentData = response.data.data.studentApplications;
        const totalCount = response.data.data.applicationCount || 0;
        const jobStatus = response.data.data.jobStatus; // Get job status from response
        
        // Calculate total pages
        const pages = Math.ceil(totalCount / itemsPerPage);
        setTotalPages(pages > 0 ? pages : 1);
        
        // Filter out rejected and inactive applications
        const filteredStudents = studentData.filter(student => 
          student.applicationStatus !== "REJECTED" && 
          student.applicationStatus !== "INACTIVE"
        );
        
        // Fetch profile pictures for all students
        const transformedStudents = await Promise.all(
          filteredStudents.map(async (student) => {
            // If profilePictureUrl is null, use default image
            let avatarUrl = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80";
            
            // If profilePictureUrl is not null, fetch the actual URL
            if (student.profilePictureUrl !== null) {
              const profilePicUrl = await fetchProfilePicture(student.id);
              if (profilePicUrl) {
                avatarUrl = profilePicUrl;
              }
            }
            
            return {
              applicationId: student.applicationId,
              studentId: student.id,
              name: student.name,
              location: student.location,
              rating: student.rating || 0,
              avatar: avatarUrl,
              status: student.applicationStatus,
              rated: student.rated, // Add rated status
              jobStatus: jobStatus // Add job status
            };
          })
        );
        
        // Sort applications:
        // 1. CONFIRMED first
        // 2. ACCEPTED second
        // 3. PENDING sorted by rating (highest to lowest)
        const sortedStudents = transformedStudents.sort((a, b) => {
          if (a.status === "CONFIRMED" && b.status !== "CONFIRMED") return -1;
          if (a.status !== "CONFIRMED" && b.status === "CONFIRMED") return 1;
          if (a.status === "ACCEPTED" && b.status !== "ACCEPTED") return -1;
          if (a.status !== "ACCEPTED" && b.status === "ACCEPTED") return 1;
          // If both are PENDING, sort by rating (highest first)
          if (a.status === "PENDING" && b.status === "PENDING") {
            return b.rating - a.rating;
          }
          return 0;
        });
        
        setStudents(sortedStudents);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Error fetching student applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupApplications = async (page) => {
    try {
      const response = await axios.get(
        `http://localhost:8100/api/v1/application/group-applications/job/${jobId}?page=${page}&pageSize=${itemsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );
      
      if (response.data.code === 200) {
        const groupData = response.data.data.groupApplications || [];
        const totalCount = response.data.data.applicationCount || 0;
        const jobStatus = response.data.data.jobStatus; // Get job status from response
        
        // Calculate total pages
        const pages = Math.ceil(totalCount / itemsPerPage);
        setTotalPages(pages > 0 ? pages : 1);
        
        // Filter out rejected and inactive applications
        const filteredGroups = groupData.filter(group => 
          group.applicationStatus !== "REJECTED" && 
          group.applicationStatus !== "INACTIVE"
        );
        
        // Process each group and fetch profile pictures for members
        const transformedGroups = await Promise.all(
          filteredGroups.map(async (group) => {
            // Process each member in the group to get their profile picture
            const membersWithAvatars = await Promise.all(
              group.members.map(async (member) => {
                // If profilePictureUrl is null, use default image
                let avatarUrl = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80";
                
                // If profilePictureUrl is not null, fetch the actual URL
                if (member.profilePictureUrl !== null) {
                  const profilePicUrl = await fetchProfilePicture(member.id);
                  if (profilePicUrl) {
                    avatarUrl = profilePicUrl;
                  }
                }
                
                return {
                  ...member,
                  avatar: avatarUrl,
                  rated: member.rated // Include rated status
                };
              })
            );
            
            // Calculate average rating for the group
            const totalRating = membersWithAvatars.reduce((sum, member) => sum + (member.rating || 0), 0);
            const averageRating = membersWithAvatars.length > 0 ? totalRating / membersWithAvatars.length : 0;
            
            return {
              applicationId: group.applicationId,
              groupId: group.groupId,
              groupName: group.groupName,
              status: group.applicationStatus,
              members: membersWithAvatars,
              averageRating: averageRating, // Store the average rating
              jobStatus: jobStatus // Add job status
            };
          })
        );
        
        // Sort groups:
        // 1. CONFIRMED first
        // 2. ACCEPTED second
        // 3. PENDING sorted by average rating (highest to lowest)
        const sortedGroups = transformedGroups.sort((a, b) => {
          if (a.status === "CONFIRMED" && b.status !== "CONFIRMED") return -1;
          if (a.status !== "CONFIRMED" && b.status === "CONFIRMED") return 1;
          if (a.status === "ACCEPTED" && b.status !== "ACCEPTED") return -1;
          if (a.status !== "ACCEPTED" && b.status === "ACCEPTED") return 1;
          // If both are PENDING, sort by average rating (highest first)
          if (a.status === "PENDING" && b.status === "PENDING") {
            return b.averageRating - a.averageRating;
          }
          return 0;
        });
        
        setGroups(sortedGroups);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Error fetching group applications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    } else {
      setError("Job ID is missing from the URL.");
      setLoading(false);
    }
  }, [jobId]);

  const updateApplicationStatus = async (applicationId) => {
    try {
      const response = await axios.put(
        `http://localhost:8100/api/employers/applications/select/${applicationId}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );
      
      if (response.data.code === 200) {
        // Refresh applications after successful update
        if (job?.requiredWorkers === 1) {
          fetchStudentApplications(currentPage);
        } else {
          fetchGroupApplications(currentPage);
        }
      }
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  const handleConfirmGroup = async (groupId) => {
    const group = groups.find(g => g.groupId === groupId);
    if (!group) return;
    
    await updateApplicationStatus(group.applicationId);
  };

  const handleConfirmStudent = async (studentId) => {
    const student = students.find(s => s.studentId === studentId);
    if (!student) return;
    
    await updateApplicationStatus(student.applicationId);
  };

  // Function to navigate to student profile
  const goToStudentProfile = (studentId) => {
    navigate(`/profile?userId=${studentId}`);
  };

  // Function to navigate to student profile for feedback
  const goToStudentProfileWithFeedback = (studentId, applicationId) => {
    navigate(`/profile?userId=${studentId}&applicationId=${applicationId}`);
  };

  // Check if there are any accepted or confirmed applications
  const hasAcceptedOrConfirmedStudents = students.some(s => 
    s.status === "ACCEPTED" || s.status === "CONFIRMED"
  );
  
  const hasAcceptedOrConfirmedGroups = groups.some(g => 
    g.status === "ACCEPTED" || g.status === "CONFIRMED"
  );

  // Pagination handler
  const handlePageChange = (newPage) => {
    if (job?.requiredWorkers === 1) {
      fetchStudentApplications(newPage);
    } else {
      fetchGroupApplications(newPage);
    }
  };

  // Loading state with improved animation
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin inline-block w-10 h-10 border-[3px] border-current border-t-transparent text-purple-600 rounded-full" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  // Error state with improved styling
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-5 rounded-lg shadow-md max-w-lg">
          <div className="flex items-center mb-2">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
            </svg>
            <p className="font-semibold">Error</p>
          </div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section - Added gradient overlay for better text visibility */}
      <div
        className="relative h-[70vh] bg-cover bg-center transition-all duration-300 shadow-xl"
        style={{ backgroundImage: `url('${job?.coverImage}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70">
          <div className="max-w-7xl mx-auto h-full flex flex-col justify-center px-6">
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
              <br />
              <span className="text-shadow-lg">{job?.title || 'Job Details'}</span>
              <br /> <span className="text-blue-400 text-shadow-sm">Part-time</span> Job
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Job Details Card */}
        {job && (
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 mt-6">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Job Details</h2>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{job.companyName}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{job.description}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm bg-gray-50 p-4 rounded-lg">
                  <div className="transition-all hover:bg-gray-100 p-3 rounded">
                    <p className="font-medium text-gray-700">Date:</p>
                    <p className="text-gray-600">{job.date}</p>
                  </div>
                  <div className="transition-all hover:bg-gray-100 p-3 rounded">
                    <p className="font-medium text-gray-700">Time:</p>
                    <p className="text-gray-600">{job.time}</p>
                  </div>
                  <div className="transition-all hover:bg-gray-100 p-3 rounded">
                    <p className="font-medium text-gray-700">Gender:</p>
                    <p className="text-gray-600">{job.gender}</p>
                  </div>
                  <div className="transition-all hover:bg-gray-100 p-3 rounded">
                    <p className="font-medium text-gray-700">Required Workers:</p>
                    <p className="text-gray-600">{job.requiredWorkers}</p>
                  </div>
                </div>
                
                <p className="text-lg font-semibold text-green-600 mt-5 bg-green-50 inline-block py-2 px-4 rounded-full">
                  {job.salary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Group Applications Section - Enhanced */}
        {job?.requiredWorkers > 1 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Group Applications</h2>
            <div className="space-y-5">
              {groups.length > 0 ? (
                groups.map(group => (
                  <div key={group.groupId} className="transform hover:-translate-y-1 transition-transform duration-200">
                    <GroupTeam
                      groupName={group.groupName}
                      members={group.members}
                      onConfirm={() => handleConfirmGroup(group.groupId)}
                      isConfirmed={group.status === "ACCEPTED" || group.status === "CONFIRMED"}
                      status={group.status}
                      averageRating={group.averageRating.toFixed(1)}
                      disabled={(job.status !== "PENDING" && group.status === "PENDING" && hasAcceptedOrConfirmedGroups)}
                      onClickMember={goToStudentProfile}
                      jobStatus={group.jobStatus}
                      applicationId={group.applicationId}
                      onFeedbackClick={goToStudentProfileWithFeedback}
                    />
                  </div>
                ))
              ) : (
                <div className="bg-white p-10 rounded-lg shadow text-center">
                  <p className="text-gray-500 text-lg">No group applications found.</p>
                </div>
              )}
            </div>

            {/* Enhanced Pagination */}
            {groups.length > 0 && (
              <div className="flex justify-center mt-8">
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                    className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-gray-500 ring-1 ring-inset ring-gray-300 hover:bg-gray-100 transition-colors ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={currentPage === 0}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        currentPage === i
                          ? 'z-10 bg-purple-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                    className={`relative inline-flex items-center rounded-r-md px-3 py-2 text-gray-500 ring-1 ring-inset ring-gray-300 hover:bg-gray-100 transition-colors ${currentPage === totalPages - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={currentPage === totalPages - 1}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5-4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </section>
        )}

        {/* Individual Applications Section - Enhanced */}
        {job?.requiredWorkers === 1 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Individual Applications</h2>
            <div className="space-y-5">
              {students.length > 0 ? (
                students.map(student => (
                  <div 
                    key={student.studentId} 
                    className="transform hover:-translate-y-1 transition-transform duration-200"
                  >
                    <Student
                      student={student}
                      onConfirm={(e) => {
                        e.stopPropagation(); // Prevent navigation when clicking the confirm button
                        handleConfirmStudent(student.studentId);
                      }}
                      isConfirmed={student.status === "ACCEPTED" || student.status === "CONFIRMED"}
                      status={student.status}
                      disabled={(job.status !== "PENDING" && student.status === "PENDING" && hasAcceptedOrConfirmedStudents)}
                      onStudentClick={goToStudentProfile}
                      showFeedbackButton={student.jobStatus === "FINISH" && !student.rated}
                      onFeedbackClick={(e) => {
                        e.stopPropagation(); // Prevent navigation when clicking feedback button
                        goToStudentProfileWithFeedback(student.studentId, student.applicationId);
                      }}
                    />
                  </div>
                ))
              ) : (
                <div className="bg-white p-10 rounded-lg shadow text-center">
                  <p className="text-gray-500 text-lg">No student applications found.</p>
                </div>
              )}
            </div>

            {/* Enhanced Pagination */}
            {students.length > 0 && (
              <div className="flex justify-center mt-8">
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                    className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-gray-500 ring-1 ring-inset ring-gray-300 hover:bg-gray-100 transition-colors ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={currentPage === 0}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        currentPage === i
                          ? 'z-10 bg-purple-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                    className={`relative inline-flex items-center rounded-r-md px-3 py-2 text-gray-500 ring-1 ring-inset ring-gray-300 hover:bg-gray-100 transition-colors ${currentPage === totalPages - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={currentPage === totalPages - 1}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5-4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default Application;