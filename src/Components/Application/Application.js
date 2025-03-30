import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import GroupTeam from "./GroupTeam";
import Student from "./Student";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useParams } from "react-router-dom"; 
const Application = () => {
  const [job, setJob] = useState(null);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmedGroupId, setConfirmedGroupId] = useState(null);
  const [confirmedStudentId, setConfirmedStudentId] = useState(null);

  // Get jobId from URL query parameters
  const { jobId } = useParams();


  // Function to decode the JWT token and get the user ID
  const getUserIdFromToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.user_id;
      
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Fetch job details and applications
  useEffect(() => {
    const fetchData = async () => {
      if (!jobId) {
        setError("Job ID not found in URL");
        setLoading(false);
        return;
      }

      try {
        // Fetch job details
        const jobResponse = await axios.get(`http://localhost:8100/api/v1/jobs/${jobId}`);
        setJob(jobResponse.data);

        // Fetch group applications
        const groupResponse = await axios.get(`http://localhost:8100/api/v1/application/pending-group/job/${jobId}`);
        const transformedGroups = groupResponse.data.data.map(group => ({
          applicationId: group.applicationId,
          groupId: group.groupId,
          groupName: group.groupName,
          members: group.members.map(member => ({
            id: member.id,
            name: member.name,
            location: member.location,
            rating: member.rating,
            avatar: member.avatar,
          })),
        }));
        setGroups(transformedGroups);

        // Fetch student applications
        const studentResponse = await axios.get(`http://localhost:8100/api/v1/application/pending-student/job/${jobId}`);
        const transformedStudents = studentResponse.data.data.map(student => ({
          applicationId: student.applicationId,
          studentId: student.id,
          name: student.name,
          location: student.location,
          rating: student.rating,
          avatar: student.profilePictureUrl,
        }));
        setStudents(transformedStudents);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  const updateApplicationStatus = async (applicationId, newStatus) => {
    const token = localStorage.getItem("token");
    const userId = getUserIdFromToken(token);
    
    if (!userId) {
      console.error("User ID not found in token.");
      return;
    }
  
    try {
      const response = await axios.put(
        `http://localhost:8100/api/v1/application/${applicationId}/status`,
        null, // No request body
        {
          params: { 
            newStatus, 
            userId // Send userId as query parameter
          }
        }
      );
      console.log("Status update response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating application status:", error.response || error);
      throw error; // Re-throw to handle in calling function
    }
  };

  const handleConfirmGroup = async (groupId) => {
    const group = groups.find(g => g.groupId === groupId);
    if (!group) return;

    setConfirmedGroupId(groupId);
    setConfirmedStudentId(null);

    await updateApplicationStatus(group.applicationId, "ACCEPTED");
  };

  const handleConfirmStudent = async (studentId) => {
    const student = students.find(s => s.studentId === studentId);
    if (!student || confirmedStudentId === studentId) return;

    setConfirmedStudentId(studentId);
    setConfirmedGroupId(null);

    await updateApplicationStatus(student.applicationId, "ACCEPTED");
  };

  const isJobFilled = confirmedGroupId !== null || confirmedStudentId !== null;

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <p className="text-xl">Loading...</p>
    </div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">
      <p className="text-red-500 text-xl">{error}</p>
    </div>;
  }

  if (!job) {
    return <div className="flex justify-center items-center h-screen">
      <p className="text-xl">No job details found.</p>
    </div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Hero Section */}
      <div
        className="relative h-[70vh] bg-cover bg-center"
        style={{ backgroundImage: `url('${job.coverImage}')` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50">
          <div className="max-w-7xl mx-auto h-full flex flex-col justify-center px-6">
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              <br />
              Created
              <br /> <span className="text-blue-400">Part-time</span> Jobs
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6">
        {/* Job Details Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-2xl font-bold text-center mb-4">Job Details</h2>
          <div className="flex items-start gap-4">
            <img
              src={job.companyLogo}
              alt="Company Logo"
              className="w-16 h-16 rounded-full"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{job.companyName}</h3>
              <p className="text-gray-600 mb-4">{job.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Date:</p>
                  <p className="text-gray-600">{job.date}</p>
                </div>
                <div>
                  <p className="font-medium">Time:</p>
                  <p className="text-gray-600">{job.time}</p>
                </div>
                <div>
                  <p className="font-medium">Gender:</p>
                  <p className="text-gray-600">{job.gender}</p>
                </div>
                <div>
                  <p className="font-medium">Required Workers:</p>
                  <p className="text-gray-600">{job.requiredWorkers}</p>
                </div>
              </div>
              
              <p className="text-lg font-semibold text-green-600 mt-4">
                {job.salary}
              </p>
            </div>
          </div>
        </div>

        {/* Confirmed Selection */}
        {isJobFilled && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-center mb-4">Confirmed Selection</h2>
            {confirmedGroupId ? (
              <GroupTeam
                groupName={groups.find(g => g.groupId === confirmedGroupId).groupName}
                members={groups.find(g => g.groupId === confirmedGroupId).members}
                isConfirmed
              />
            ) : (
              confirmedStudentId && (
                <Student
                  student={students.find(s => s.studentId === confirmedStudentId)}
                  isConfirmed
                />
              )
            )}
          </div>
        )}

        {/* Group Applications - Hidden if Job is Filled */}
        {!isJobFilled && (
          <section className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Group Applications</h2>
            <div className="space-y-4">
              {groups.map(group => (
                <GroupTeam
                  key={group.groupId}
                  groupName={group.groupName}
                  members={group.members}
                  onConfirm={() => handleConfirmGroup(group.groupId)}
                  isConfirmed={confirmedGroupId === group.groupId}
                  disabled={isJobFilled}
                />
              ))}
            </div>
          </section>
        )}

        {/* Individual Applications - Hidden if Job is Filled */}
        {!isJobFilled && (
          <section className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Individual Applications</h2>
            <div className="space-y-4">
              {students.map(student => (
                <Student
                  key={student.studentId}
                  student={student}
                  onConfirm={() => handleConfirmStudent(student.studentId)}
                  isConfirmed={confirmedStudentId === student.studentId}
                  disabled={isJobFilled}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Application;