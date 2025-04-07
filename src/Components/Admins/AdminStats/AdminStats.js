import React, { useRef, useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import html2pdf from 'html2pdf.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);
const baseUrl = window._env_.BASE_URL;

const AdminStats = ({ statsData, loading }) => {
  const navigate = useNavigate();
  const statsRef = useRef(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Function to download stats as PDF
  const downloadPDF = async () => {
    setGeneratingPDF(true);
    const element = statsRef.current;
    
    // Get current date range from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const startDate = urlParams.get('startDate') || new Date().toISOString().split('T')[0];
    const endDate = urlParams.get('endDate') || new Date().toISOString().split('T')[0];
    const dateRangeString = `${startDate}_to_${endDate}`;
    
    // Better PDF options with landscape orientation
    const opt = {
      margin: [10, 10, 10, 10], // top, right, bottom, left margins in mm
      filename: `UniEarn_Statistics_${dateRangeString}.pdf`,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left">
            Admin Dashboard Statistics
          </h1>
          <button 
            onClick={downloadPDF}
            disabled={generatingPDF}
            className={`px-4 py-2 w-full sm:w-auto ${generatingPDF ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} 
            text-white rounded-lg transition-colors flex items-center justify-center shadow-md`}
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
              <div className="animate-spin mx-auto h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="mt-4 text-lg text-gray-600">Loading statistics...</p>
            </div>
          ) : !statsData || statsData.code !== 200 ? (
            <div className="text-center py-8 bg-red-50 border border-red-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="mt-2 text-lg font-medium text-red-600">Error loading statistics</p>
              <p className="text-sm text-red-500">{statsData?.message || "Please try again later"}</p>
            </div>
          ) : (
            <>
              {/* Summary Stats Dashboard - More responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 avoid-break-inside">
                <div className="bg-white border border-gray-200 p-4 rounded-lg text-center shadow-sm">
                  <p className="text-lg font-semibold text-gray-700">Total Jobs Posted</p>
                  <p className="text-2xl text-indigo-600">{statsData.data.totalJobsPosted || 0}</p>
                </div>
                
                <div className="bg-white border border-gray-200 p-4 rounded-lg text-center shadow-sm">
                  <p className="text-lg font-semibold text-gray-700">Active Users</p>
                  <p className="text-2xl text-blue-600">{statsData.data.activeUsers || 0}</p>
                </div>
                
                <div className="bg-white border border-gray-200 p-4 rounded-lg text-center shadow-sm">
                  <p className="text-lg font-semibold text-gray-700">Total Applications</p>
                  <p className="text-2xl text-green-600">{statsData.data.totalApplications || 0}</p>
                </div>
                
                <div className="bg-white border border-gray-200 p-4 rounded-lg text-center shadow-sm">
                  <p className="text-lg font-semibold text-gray-700">Completed Jobs</p>
                  <p className="text-2xl text-purple-600">{statsData.data.completedJobs || 0}</p>
                </div>
              </div>

              {/* Most Applied Job - Better responsive layout */}
              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm mb-8 avoid-break-inside">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Most Applied Job</h2>
                {statsData.data.mostAppliedJob && statsData.data.mostAppliedJob.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {statsData.data.mostAppliedJob.map((job) => (
                          <tr key={job.jobId} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{job.jobTitle}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-indigo-600">{job.jobCategory}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600">${job.jobPayment}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{job.employer?.companyName || "N/A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">No most applied job data available.</p>
                )}
              </div>

              {/* Least Applied Job - Consistent with most applied job */}
              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm mb-8 avoid-break-inside">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Least Applied Job</h2>
                {statsData.data.leastAppliedJob && statsData.data.leastAppliedJob.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {statsData.data.leastAppliedJob.map((job) => (
                          <tr key={job.jobId} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{job.jobTitle}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-indigo-600">{job.jobCategory}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600">${job.jobPayment}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{job.employer?.companyName || "N/A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">No least applied job data available.</p>
                )}
              </div>

              {/* Top Employer and Most Active Student - Responsive grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 avoid-break-inside">
                <div
                  className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={handleTopEmployerClick}
                >
                  <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                      <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                    </svg>
                    Top Employer
                  </h2>
                  {statsData.data.topEmployer ? (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-lg flex items-center">
                        <span className="font-semibold text-gray-700 mr-2">Username:</span> 
                        <span className="text-blue-700">{statsData.data.topEmployer.userName}</span>
                      </p>
                      <p className="mt-2 flex items-center">
                        <span className="font-semibold text-gray-700 mr-2">Email:</span>{" "}
                        <span className="text-indigo-600">{statsData.data.topEmployer.email}</span>
                      </p>
                      <p className="mt-2 text-gray-500 text-sm">Click to view profile</p>
                    </div>
                  ) : (
                    <p className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">No top employer data available.</p>
                  )}
                </div>
                
                <div
                  className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={handleMostActiveStudentClick}
                >
                  <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                    Most Active Student
                  </h2>
                  {statsData.data.mostActiveStudent ? (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-lg flex items-center">
                        <span className="font-semibold text-gray-700 mr-2">Username:</span> 
                        <span className="text-green-700">{statsData.data.mostActiveStudent.userName}</span>
                      </p>
                      <p className="mt-2 flex items-center">
                        <span className="font-semibold text-gray-700 mr-2">Email:</span>{" "}
                        <span className="text-indigo-600">{statsData.data.mostActiveStudent.email}</span>
                      </p>
                      <p className="mt-2 text-gray-500 text-sm">Click to view profile</p>
                    </div>
                  ) : (
                    <p className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">No most active student data available.</p>
                  )}
                </div>
              </div>

              {/* Pie Charts - Improved responsiveness */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 avoid-break-inside">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-medium text-gray-700 mb-2 text-center">Jobs by Category</h3>
                  <div className="h-64 sm:h-80 mx-auto">
                    <Pie
                      data={{ ...categoryChartData, options: { ...chartOptions, title: { ...chartOptions.title, text: "Jobs by Category" } } }}
                      options={{ ...chartOptions, maintainAspectRatio: true }}
                    />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-medium text-gray-700 mb-2 text-center">Jobs by Location</h3>
                  <div className="h-64 sm:h-80 mx-auto">
                    <Pie
                      data={{ ...locationChartData, options: { ...chartOptions, title: { ...chartOptions.title, text: "Jobs by Location" } } }}
                      options={{ ...chartOptions, maintainAspectRatio: true }}
                    />
                  </div>
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
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No authentication token found");
        return;
      }
      
      const response = await axios.post(
        `${baseUrl}/api/admin/stats`,
        {
          startDate: startDate ? new Date(startDate).toISOString() : null,
          endDate: endDate ? new Date(endDate).toISOString() : null,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Add token to request headers
          },
        }
      );
      setStatsData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Handle authentication/authorization errors
        navigate('/login'); 
      }
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
    <div className="relative h-[60vh] bg-cover bg-center"
      style={{
          backgroundImage:
              'url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80")',
      }}
      >
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/40 backdrop-blur-[1px]">
        <div className="max-w-7xl mx-auto h-full flex flex-col justify-end pb-24 px-4 sm:px-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-md mt-20">
            Platform<br />
            <span className="text-blue-400 drop-shadow-lg">Statistics</span>
          </h1>
          <p className="mt-3 text-white/90 text-lg sm:text-xl max-w-2xl drop-shadow-sm">
            Insights into platform performance
          </p>
        </div>
      </div>
    </div>
    
    {/* Content Section - Updated to match ESummary style */}
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Platform Analysis
          </h1>
        </div>
        
        {/* Date Filter Section - Improved with ESummary styling */}
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
        
        {/* Admin Stats - Maintaining the current AdminStats component */}
        <AdminStats statsData={statsData} loading={loading} />
      </div>
    </div>
  </div>
);
};

export default App;