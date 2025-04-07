import React, { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import html2pdf from 'html2pdf.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);
const baseUrl = window._env_.BASE_URL;

const ApplicationSummary = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const summaryRef = useRef(null);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().slice(0, 10); // Only date, no time
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().slice(0, 10); // Only date, no time
  });

  // Function to download summary as PDF
  const downloadPDF = async () => {
    setGeneratingPDF(true);
    const element = summaryRef.current;
    
    // Better PDF options with landscape orientation
    const opt = {
      margin: [10, 10, 10, 10], // top, right, bottom, left margins in mm
      filename: `UniEarn_Student_Summary_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 1.5,
        useCORS: true,
        letterRendering: true,
        logging: false,
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'landscape',
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      await html2pdf()
        .set(opt)
        .from(element)
        .toPdf()
        .get('pdf')
        .then((pdf) => {
          // Add page numbers
          const totalPages = pdf.internal.getNumberOfPages();
          for(let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(10);
            pdf.setTextColor(150);
            pdf.text(`Page ${i} of ${totalPages}`, pdf.internal.pageSize.getWidth() - 30, pdf.internal.pageSize.getHeight() - 10);
          }
        })
        .save();
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setGeneratingPDF(false);
    }
  };

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
        const response = await axios.post(
          `${baseUrl}/api/v1/application/student/summary`,
          {
            studentId: userId,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString()
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setSummaryData(response.data.data); // Updated to match new response structure
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch summary data");
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, [startDate, endDate]);

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
    labels: ["Confirmed", "Pending", "Rejected", "Accepted", "Inactive"],
    datasets: [
      {
        data: [
          summaryData.statusPercentages.CONFIRMED || 0,
          summaryData.statusPercentages.PENDING || 0,
          summaryData.statusPercentages.REJECTED || 0,
          summaryData.statusPercentages.ACCEPTED || 0,
          summaryData.statusPercentages.INACTIVE || 0,
        ],
        backgroundColor: ["#34D399", "#F97316", "#EF4444", "#A855F7", "#6B7280"], // Added Purple for Accepted, Gray for Inactive
        hoverBackgroundColor: ["#2DD4BF", "#F97316", "#DC2626", "#9333EA", "#4B5563"],
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
    maintainAspectRatio: false,  // Allow chart to fill container
    plugins: {
      legend: { position: "top", labels: { color: "#6B7280" } },
      title: { display: true, text: "Applications by Category", color: "#6B7280" },
      tooltip: {
        callbacks: {
          title: function(tooltipItems) {
            // Display full category name in tooltip
            return tooltipItems[0].label;
          }
        }
      }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        title: { display: true, text: "Count", color: "#6B7280" }, 
        ticks: { color: "#6B7280" } 
      },
      x: { 
        title: { display: true, text: "Categories", color: "#6B7280" }, 
        ticks: { 
          color: "#6B7280",
          autoSkip: false,      // Prevent skipping labels
          maxRotation: 45,      // Rotate labels to fit
          minRotation: 45,      // Ensure consistent rotation
          callback: function(value, index) {
            // Truncate long category names but show full name on hover
            const label = this.getLabelForValue(index);
            return label.length > 15 ? label.substring(0, 12) + '...' : label;
          }
        } 
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div
        className="relative h-[60vh] bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/40 backdrop-blur-[1px]">
          <div className="max-w-7xl mx-auto h-full flex flex-col justify-end pb-24 px-4 sm:px-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-md mt-20">
              My<br />
              <span className="text-blue-400 drop-shadow-lg">Activities</span>
            </h1>
            <p className="mt-3 text-white/90 text-lg sm:text-xl max-w-2xl drop-shadow-sm">
              Track your job applications and opportunities
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Application Summary
            </h1>
            <button 
              onClick={downloadPDF}
              disabled={generatingPDF || loading || error}
              className={`px-4 py-2 ${generatingPDF || loading || error ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} 
              text-white rounded-lg transition-colors flex items-center shadow-md`}
            >
              {generatingPDF ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
          </div>

          {/* PDF Content */}
          <div ref={summaryRef} className="pdf-content">
            {/* Date Filter Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Filter by Date Range</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-lg text-gray-600">Loading...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-lg text-pink-500">Error: {error}</p>
              </div>
            ) : (
              <>
                {/* Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 avoid-break-inside">
                  <div className="bg-white border border-gray-200 p-4 rounded-lg text-center shadow-sm relative group">
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-700 text-white text-xs sm:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-[180px] sm:w-[220px] z-10 pointer-events-none text-center">
                      Team applications that are not confirmed by other members. These applications cannot be seen by companies.
                    </div>
                    <p className="text-lg font-semibold text-gray-500">Inactive</p>
                    <p className="text-2xl text-gray-500">{summaryData.inactive}</p>
                  </div>
                  <div className="bg-white border border-gray-200 p-4 rounded-lg text-center shadow-sm relative group">
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-700 text-white text-xs sm:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-[180px] sm:w-[220px] z-10 pointer-events-none text-center">
                      Pending applications that can be seen by companies.
                    </div>
                    <p className="text-lg font-semibold text-orange-500">Pending</p>
                    <p className="text-2xl text-orange-500">{summaryData.pending}</p>
                  </div>
                  <div className="bg-white border border-gray-200 p-4 rounded-lg text-center shadow-sm relative group">
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-700 text-white text-xs sm:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-[180px] sm:w-[220px] z-10 pointer-events-none text-center">
                      Applications that have been accepted by companies.
                    </div>
                    <p className="text-lg font-semibold text-purple-500">Accepted</p>
                    <p className="text-2xl text-purple-500">{summaryData.accepted}</p>
                  </div>
                  <div className="bg-white border border-gray-200 p-4 rounded-lg text-center shadow-sm relative group">
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-700 text-white text-xs sm:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-[180px] sm:w-[220px] z-10 pointer-events-none text-center">
                      Applications that have been rejected by companies.
                    </div>
                    <p className="text-lg font-semibold text-pink-500">Rejected</p>
                    <p className="text-2xl text-pink-500">{summaryData.rejected}</p>
                  </div>
                  <div className="bg-white border border-gray-200 p-4 rounded-lg text-center shadow-sm relative group">
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-700 text-white text-xs sm:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-[180px] sm:w-[220px] z-10 pointer-events-none text-center">
                      Applications that have been accepted by companies and confirmed by the student.
                    </div>
                    <p className="text-lg font-semibold text-teal-500">Confirmed</p>
                    <p className="text-2xl text-teal-500">{summaryData.confirmed}</p>
                  </div>
                </div>

                <div className="text-center mb-8 avoid-break-inside">
                  <p className="text-lg font-semibold text-gray-700">
                    Total Applications:{" "}
                    <span className="text-blue-500">{summaryData.totalApplications}</span>
                  </p>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 avoid-break-inside">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <Pie data={pieData} options={pieOptions} />
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow" style={{ minHeight: "400px" }}>
                    <Bar data={barData} options={barOptions} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSummary;