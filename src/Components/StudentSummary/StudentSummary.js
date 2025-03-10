import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const ApplicationSummary = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummaryData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found");
        setLoading(false);
        return;
      }

      let userId;
      try {
        const decodedToken = jwtDecode(token);
        userId = decodedToken.user_id;
        console.log(`Decoded user_id: ${userId}`);
      } catch (err) {
        setError("Error decoding token");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:8100/api/v1/application/student/${userId}/summary`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setSummaryData(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch summary data");
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-lg text-pink-500">Error: {error}</p>
      </div>
    );
  }

  // Prepare data for Pie Chart (Status Percentages)
  const pieData = {
    labels: ["Confirmed", "Pending", "Rejected"],
    datasets: [
      {
        data: [
          summaryData.statusPercentages.CONFIRMED,
          summaryData.statusPercentages.PENDING,
          summaryData.statusPercentages.REJECTED,
        ],
        backgroundColor: ["#34D399", "#F97316", "#EF4444"], // Green, Orange, Red
        hoverBackgroundColor: ["#2DD4BF", "#F97316", "#DC2626"],
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top", labels: { color: "#6B7280" } },
      title: { display: true, text: "Application Status Percentages", color: "#6B7280" },
    },
  };

  // Prepare data for Bar Chart (Category Breakdown)
  const barData = {
    labels: Object.keys(summaryData.categoryBreakdown),
    datasets: [
      {
        label: "Number of Applications",
        data: Object.values(summaryData.categoryBreakdown),
        backgroundColor: "#3B82F6",
        borderColor: "#2563EB",
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top", labels: { color: "#6B7280" } },
      title: { display: true, text: "Applications by Category", color: "#6B7280" },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Count", color: "#6B7280" }, ticks: { color: "#6B7280" } },
      x: { title: { display: true, text: "Categories", color: "#6B7280" }, ticks: { color: "#6B7280" } },
    },
  };

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
              My<br />
              <span className="text-blue-400 drop-shadow-lg">Activities</span>
            </h1>
            <p className="mt-2 text-white/90 text-lg sm:text-xl max-w-2xl">
              Track your job applications and opportunities
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Application Summary
          </h1>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-gray-200 p-4 rounded-lg text-center shadow-sm">
              <p className="text-lg font-semibold text-teal-500">Confirmed</p>
              <p className="text-2xl text-teal-500">{summaryData.confirmed}</p>
            </div>
            <div className="bg-white border border-gray-200 p-4 rounded-lg text-center shadow-sm">
              <p className="text-lg font-semibold text-orange-500">Pending</p>
              <p className="text-2xl text-orange-500">{summaryData.pending}</p>
            </div>
            <div className="bg-white border border-gray-200 p-4 rounded-lg text-center shadow-sm">
              <p className="text-lg font-semibold text-pink-500">Rejected</p>
              <p className="text-2xl text-pink-500">{summaryData.rejected}</p>
            </div>
            <div className="bg-white border border-gray-200 p-4 rounded-lg text-center shadow-sm">
              <p className="text-lg font-semibold text-purple-500">Accepted</p>
              <p className="text-2xl text-purple-500">{summaryData.accepted}</p>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-lg font-semibold text-gray-700">
              Total Applications:{" "}
              <span className="text-blue-500">{summaryData.totalApplications}</span>
            </p>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <Pie data={pieData} options={pieOptions} />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSummary;