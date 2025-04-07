import { useState, useEffect } from "react";
import GroupTeam from "./GroupTeam";
import Student from "./Student";
import axios from "axios";

const baseUrl = window._env_.BASE_URL;
const Application = () => {
  // Mock job data
  const [mockJob] = useState({
    id: 1,
    companyName: "K&D Garment",
    description: "නොවැම්බර් 16 සිට vote activation sampling and selling සඳහා sales ප්‍රවර්ධන ක්‍රියාවලිය 2ක් පැවැත්වේ.",
    date: "16th Dec 2024 - 22nd Dec 2024",
    time: "9.00am to 6.00pm",
    gender: "Female",
    requiredWorkers: 1,  // Only 1 worker is required for this example
    salary: "Rs.3500.00",
    companyLogo: "/job-logo.png",
    coverImage: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80"
  });

  
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch group applications
        const groupResponse = await axios.get(`${baseUrl}/api/v1/application/pending-group/job/8`);
        const transformedGroups = groupResponse.data.map(group => ({
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
        const studentResponse = await axios.get(`${baseUrl}/api/v1/application/pending-student/job/8`);
        const transformedStudents = studentResponse.data.map(student => ({
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
        // Fallback to mock data if the backend request fails
        setGroups([
          {
            groupId: 1,
            groupName: "Group 1",
            members: [
              {
                id: 1,
                name: "Aathif Mohamed",
                location: "Colombo",
                rating: 4,
                avatar: "/studentImages/stu2.png",
              },
              {
                id: 2,
                name: "Umesha Hasinduni",
                location: "Gampaha",
                rating: 5,
                avatar: "/studentImages/stu3.jpeg",
              },
            ],
          },
          {
            groupId: 2,
            groupName: "Group 2",
            members: [
              {
                id: 3,
                name: "Uditha Chathuranga",
                location: "Gampaha",
                rating: 3,
                avatar: "/studentImages/stu1.jpeg",
              },
              {
                id: 4,
                name: "Chamal Achintha",
                location: "Colombo",
                rating: 4,
                avatar: "/studentImages/stu4.png",
              },
            ],
          },
        ]);

        setStudents([
          {
            studentId: 1,
            name: "Timasha Wanninayaka",
            location: "Kandy",
            rating: 4,
            avatar: "/studentImages/stu3.jpeg",
          },
          {
            studentId: 2,
            name: "Maleesha Wijekon",
            location: "Matara",
            rating: 5,
            avatar: "/studentImages/stu2.png",
          },
        ]);

        setError("Failed to load data. Using mock data instead.");

    } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  
  const [confirmedGroupId, setConfirmedGroupId] = useState(null);
  const [confirmedStudentId, setConfirmedStudentId] = useState(null);  // Only one student can be selected
  const { requiredWorkers } = mockJob;

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const response = await axios.put(
        `${baseUrl}/api/v1/application/${applicationId}/status`,
        null, 
        {
          params: { newStatus },
          headers: { userId: 2 }, // Replace with actual user ID
        }
      );
      console.log(response.data);
    } catch (error) {
      console.error("Error updating application status:", error);
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

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Hero Section */}
      <div
        className="relative h-[70vh] bg-cover bg-center"
        style={{ backgroundImage: `url('${mockJob.coverImage}')` }}
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
              src={mockJob.companyLogo}
              alt="Company Logo"
              className="w-16 h-16 rounded-full"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{mockJob.companyName}</h3>
              <p className="text-gray-600 mb-4">{mockJob.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Date:</p>
                  <p className="text-gray-600">{mockJob.date}</p>
                </div>
                <div>
                  <p className="font-medium">Time:</p>
                  <p className="text-gray-600">{mockJob.time}</p>
                </div>
                <div>
                  <p className="font-medium">Gender:</p>
                  <p className="text-gray-600">{mockJob.gender}</p>
                </div>
                <div>
                  <p className="font-medium">Required Workers:</p>
                  <p className="text-gray-600">{mockJob.requiredWorkers}</p>
                </div>
              </div>
              
              <p className="text-lg font-semibold text-green-600 mt-4">
                {mockJob.salary}
              </p>
            </div>
          </div>
        </div>

        {/* Loading/Error Handling */}
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

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