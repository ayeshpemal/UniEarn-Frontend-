import React, { useRef, useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import html2pdf from 'html2pdf.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const AdminStats = ({ statsData, loading }) => {
  const navigate = useNavigate();
  const statsRef = useRef(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Function to download stats as PDF
  const downloadPDF = async () => {
    setGeneratingPDF(true);
    const element = statsRef.current;
    
    // Better PDF options with landscape orientation
    const opt = {
      margin: [10, 10, 10, 10], // top, right, bottom, left margins in mm
      filename: `UniEarn_Statistics_${new Date().toISOString().split('T')[0]}.pdf`,
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

  // Pie chart data for jobs by category
  const categoryChartData = {
    labels: Object.keys(statsData?.data?.jobsByCategory || {}).length > 0
      ? Object.keys(statsData?.data?.jobsByCategory)
      : ["No Data"],
    datasets: [
      {
        data: Object.values(statsData?.data?.jobsByCategory || {}).length > 0
          ? Object.values(statsData?.data?.jobsByCategory)
          : [1],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  // Pie chart data for jobs by location
  const locationChartData = {
    labels: Object.keys(statsData?.data?.jobsByLocation || {}).length > 0
      ? Object.keys(statsData?.data?.jobsByLocation)
      : ["No Data"],
    datasets: [
      {
        data: Object.values(statsData?.data?.jobsByLocation || {}).length > 0
          ? Object.values(statsData?.data?.jobsByLocation)
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
    if (statsData?.data?.topEmployer && statsData?.data?.topEmployer.userId) {
      navigate(`/e-profile?userId=${statsData.data.topEmployer.userId}`);
    }
  };

  // Handle click on Most Active Student
  const handleMostActiveStudentClick = () => {
    if (statsData?.data?.mostActiveStudent && statsData?.data?.mostActiveStudent.userId) {
      navigate(`/profile?userId=${statsData.data.mostActiveStudent.userId}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center">
            Admin Dashboard Statistics
          </h1>
          <button 
            onClick={downloadPDF}
            disabled={generatingPDF}
            className={`px-4 py-2 ${generatingPDF ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} 
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

        {/* PDF Content with class-based page break control */}
        <div ref={statsRef} className="pdf-content">
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
              <div className="bg-white border border-gray-200 p-4 rounded-lg text-center shadow-sm mb-8 avoid-break-inside">
                <p className="text-lg font-semibold text-gray-700">Total Jobs Posted</p>
                <p className="text-2xl text-indigo-600">{statsData.data.totalJobsPosted || 0}</p>
              </div>

              {/* Most Applied Job */}
              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm mb-8 avoid-break-inside">
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
              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm mb-8 avoid-break-inside">
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

              {/* Top Employer and Most Active Student - Keep together */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 avoid-break-inside">
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

              {/* Pie Charts - Keep together */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 avoid-break-inside">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/30"></div>
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
      {/* Date Filter Section */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8"></div>
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
        {/* Admin Stats */}
        <div>
          <AdminStats statsData={statsData} loading={loading} />
        </div>
      </div>
  );
};

export default App;