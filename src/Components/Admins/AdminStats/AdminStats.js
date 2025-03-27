import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const AdminStats = ({ statsData, loading }) => {
  const navigate = useNavigate();

  // Pie chart data for jobs by category
  const categoryChartData = {
    labels: Object.keys(statsData?.data.jobsByCategory || {}).length > 0
      ? Object.keys(statsData?.data.jobsByCategory)
      : ["No Data"],
    datasets: [
      {
        data: Object.values(statsData?.data.jobsByCategory || {}).length > 0
          ? Object.values(statsData?.data.jobsByCategory)
          : [1],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  // Pie chart data for jobs by location
  const locationChartData = {
    labels: Object.keys(statsData?.data.jobsByLocation || {}).length > 0
      ? Object.keys(statsData?.data.jobsByLocation)
      : ["No Data"],
    datasets: [
      {
        data: Object.values(statsData?.data.jobsByLocation || {}).length > 0
          ? Object.values(statsData?.data.jobsByLocation)
          : [1],
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#FFCD56",
        ],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          padding: 20,
          boxWidth: 15,
          font: { size: 14 },
          color: "#6B7280",
        },
      },
      title: {
        display: true,
        color: "#6B7280",
        font: { size: 16 },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        padding: 10,
      },
    },
  };

  // Handle click on Top Employer
  const handleTopEmployerClick = () => {
    if (statsData?.data.topEmployer && statsData?.data.topEmployer.userId) {
      navigate(`/e-profile?userId=${statsData.data.topEmployer.userId}`);
    }
  };

  // Handle click on Most Active Student
  const handleMostActiveStudentClick = () => {
    if (statsData?.data.mostActiveStudent && statsData?.data.mostActiveStudent.userId) {
      navigate(`/profile?userId=${statsData.data.mostActiveStudent.userId}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Admin Dashboard Statistics
        </h1>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        ) : !statsData || statsData.code !== 200 ? (
          <div className="text-center py-8">
            <p className="text-lg text-red-600">Error loading statistics</p>
          </div>
        ) : (
          <>
            {/* Total Jobs */}
            <div className="bg-white border border-gray-200 p-4 rounded-lg text-center shadow-sm mb-8">
              <p className="text-lg font-semibold text-gray-700">Total Jobs Posted</p>
              <p className="text-2xl text-indigo-600">{statsData.data.totalJobsPosted || 0}</p>
            </div>

            {/* Most Applied Job */}
            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Most Applied Job</h2>
              {statsData.data.mostAppliedJob && statsData.data.mostAppliedJob.length > 0 ? (
                statsData.data.mostAppliedJob.map((job) => (
                  <div key={job.jobId} className="border-b py-3 last:border-b-0">
                    <p className="text-lg">
                      <span className="font-semibold text-gray-700">Title:</span> {job.jobTitle}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-700">Category:</span>{" "}
                      <span className="text-indigo-600">{job.jobCategory}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-gray-700">Description:</span> {job.jobDescription}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-700">Payment:</span>{" "}
                      <span className="text-green-600">${job.jobPayment}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-gray-700">Company:</span> {job.employer?.companyName || "N/A"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No most applied job data available.</p>
              )}
            </div>

            {/* Least Applied Job */}
            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Least Applied Job</h2>
              {statsData.data.leastAppliedJob && statsData.data.leastAppliedJob.length > 0 ? (
                statsData.data.leastAppliedJob.map((job) => (
                  <div key={job.jobId} className="border-b py-3 last:border-b-0">
                    <p className="text-lg">
                      <span className="font-semibold text-gray-700">Title:</span> {job.jobTitle}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-700">Category:</span>{" "}
                      <span className="text-indigo-600">{job.jobCategory}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-gray-700">Description:</span> {job.jobDescription}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-700">Payment:</span>{" "}
                      <span className="text-green-600">${job.jobPayment}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-gray-700">Company:</span> {job.employer?.companyName || "N/A"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No least applied job data available.</p>
              )}
            </div>

            {/* Top Employer and Most Active Student */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div
                className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50"
                onClick={handleTopEmployerClick}
              >
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Top Employer</h2>
                {statsData.data.topEmployer ? (
                  <>
                    <p className="text-lg">
                      <span className="font-semibold text-gray-700">Username:</span> {statsData.data.topEmployer.userName}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-700">Email:</span>{" "}
                      <span className="text-indigo-600">{statsData.data.topEmployer.email}</span>
                    </p>
                  </>
                ) : (
                  <p className="text-center text-gray-500">No top employer data available.</p>
                )}
              </div>
              <div
                className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50"
                onClick={handleMostActiveStudentClick}
              >
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Most Active Student</h2>
                {statsData.data.mostActiveStudent ? (
                  <>
                    <p className="text-lg">
                      <span className="font-semibold text-gray-700">Username:</span> {statsData.data.mostActiveStudent.userName}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-700">Email:</span>{" "}
                      <span className="text-indigo-600">{statsData.data.mostActiveStudent.email}</span>
                    </p>
                  </>
                ) : (
                  <p className="text-center text-gray-500">No most active student data available.</p>
                )}
              </div>
            </div>

            {/* Pie Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-4 rounded-lg shadow">
                <Pie
                  data={{ ...categoryChartData, options: { ...chartOptions, title: { ...chartOptions.title, text: "Jobs by Category" } } }}
                  options={chartOptions}
                />
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <Pie
                  data={{ ...locationChartData, options: { ...chartOptions, title: { ...chartOptions.title, text: "Jobs by Location" } } }}
                  options={chartOptions}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Updated App.jsx with initial date range set to 1 month back
const App = () => {
  const [statsData, setStatsData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // Set initial dates: one month back from current date
  const currentDate = new Date();
  const oneMonthBack = new Date();
  oneMonthBack.setMonth(currentDate.getMonth() - 1);

  const [startDate, setStartDate] = React.useState(oneMonthBack.toISOString().split("T")[0]);
  const [endDate, setEndDate] = React.useState(currentDate.toISOString().split("T")[0]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:8100/api/admin/stats",
        {
          startDate: startDate ? new Date(startDate).toISOString() : null,
          endDate: endDate ? new Date(endDate).toISOString() : null,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setStatsData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStatsData(null); // Reset statsData on error
      setLoading(false);
    }
  };

  // Scroll to top on mount
  React.useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    scrollToTop();
    window.addEventListener("load", scrollToTop);
    return () => window.removeEventListener("load", scrollToTop);
  }, []);

  // Fetch stats when startDate or endDate changes
  React.useEffect(() => {
    fetchStats();
  }, [startDate, endDate]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div
        className="relative h-[50vh] sm:h-[70vh] bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/30">
          <div className="max-w-7xl mx-auto h-full flex flex-col justify-center px-4 sm:px-6">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">
              Platform <br />
              <span className="text-blue-400 drop-shadow-lg">Statistics</span>
            </h1>
            <p className="mt-2 text-white/90 text-lg sm:text-xl max-w-2xl">
              Insights into platform performance
            </p>
          </div>
        </div>
      </div>

      {/* Date Filter Section */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Admin Stats */}
      <AdminStats statsData={statsData} loading={loading} />
    </div>
  );
};

export default App;