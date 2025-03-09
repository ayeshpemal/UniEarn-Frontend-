import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const AdminStats = ({ statsData }) => {
  // Pie chart data for jobs by category
  const categoryChartData = {
    labels: Object.keys(statsData.data.jobsByCategory || {}).length > 0
      ? Object.keys(statsData.data.jobsByCategory)
      : ["No Data"],
    datasets: [
      {
        data: Object.values(statsData.data.jobsByCategory || {}).length > 0
          ? Object.values(statsData.data.jobsByCategory)
          : [1], // Default value to render a single slice
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  // Pie chart data for jobs by location
  const locationChartData = {
    labels: Object.keys(statsData.data.jobsByLocation || {}).length > 0
      ? Object.keys(statsData.data.jobsByLocation)
      : ["No Data"],
    datasets: [
      {
        data: Object.values(statsData.data.jobsByLocation || {}).length > 0
          ? Object.values(statsData.data.jobsByLocation)
          : [1], // Default value to render a single slice
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
        position: "bottom",
        labels: {
          padding: 20,
          boxWidth: 15,
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        padding: 10,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center tracking-tight">
          Admin Dashboard Statistics
        </h1>

        {/* Total Jobs */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8 transform hover:scale-105 transition duration-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Total Jobs Posted</h2>
          <p className="text-3xl font-semibold text-indigo-600">
            {statsData.data.totalJobsPosted || 0}
          </p>
        </div>

        {/* Most Applied Job */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Most Applied Job</h2>
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
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Least Applied Job</h2>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white shadow-lg rounded-xl p-6 transform hover:scale-105 transition duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Top Employer</h2>
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
          <div className="bg-white shadow-lg rounded-xl p-6 transform hover:scale-105 transition duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Most Active Student</h2>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Jobs by Category</h2>
            <div className="max-w-md mx-auto">
              <Pie data={categoryChartData} options={chartOptions} />
            </div>
          </div>
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Jobs by Location</h2>
            <div className="max-w-md mx-auto">
              <Pie data={locationChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// App.jsx with proper API integration example
const App = () => {
  const [statsData, setStatsData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:8100/api/admin/stats");
        const data = await response.json();
        setStatsData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading statistics...</p>
      </div>
    );
  }

  if (!statsData || statsData.code !== 200) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-red-600">Error loading statistics</p>
      </div>
    );
  }

  return (
    <div>
      <AdminStats statsData={statsData} />
    </div>
  );
};

export default App;