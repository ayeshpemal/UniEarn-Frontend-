import React, { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import html2pdf from 'html2pdf.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);
const baseUrl = window._env_.BASE_URL;

const ESummary = () => {
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
      filename: `UniEarn_Employer_Summary_${new Date().toISOString().split('T')[0]}.pdf`,
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

      let employerId;
      try {
        const decodedToken = jwtDecode(token);
        employerId = decodedToken.user_id;
        console.log(`Decoded employer_id: ${employerId}`);
      } catch (err) {
        setError("Error decoding token");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${baseUrl}/api/employer/analysis/brief-summary/${employerId}?startDate=${new Date(startDate).toISOString()}&endDate=${new Date(endDate).toISOString()}`,
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
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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

  // Prepare data for Status Pie Chart
  const statusPieData = {
    labels: ["Pending", "Ongoing", "Finished", "Canceled"],
    datasets: [
      {
        data: [
          summaryData.pendingJobCount || 0,
          summaryData.ongoingJobCount || 0,
          summaryData.finishedJobCount || 0,
          summaryData.canceledJobCount || 0,
        ],
        backgroundColor: ["#F97316", "#3B82F6", "#34D399", "#EF4444"],
        hoverBackgroundColor: ["#F59E0B", "#2563EB", "#10B981", "#DC2626"],
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top", labels: { color: "#6B7280" } },
      title: { display: true, text: "Job Status Distribution", color: "#6B7280" },
    },
  };

  // Prepare data for Category Bar Chart
  const categoryBarData = {
    labels: Object.keys(summaryData.jobCountByCategory),
    datasets: [
      {
        label: "Number of Jobs",
        data: Object.values(summaryData.jobCountByCategory),
        backgroundColor: "#3B82F6",
        borderColor: "#2563EB",
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for Location Bar Chart
  const locationBarData = {
    labels: Object.keys(summaryData.jobCountByLocation),
    datasets: [
      {
        label: "Number of Jobs",
        data: Object.values(summaryData.jobCountByLocation),
        backgroundColor: "#8B5CF6",
        borderColor: "#7C3AED",
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top", labels: { color: "#6B7280" } },
      title: { display: true, text: "Jobs Distribution", color: "#6B7280" },
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
        className="relative h-[60vh] bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1542744173-05336fcc7ad4?auto=format&fit=crop&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/40 backdrop-blur-[1px]">
          <div className="max-w-7xl mx-auto h-full flex flex-col justify-end pb-24 px-4 sm:px-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-md mt-20">
              Job<br />
              <span className="text-blue-400 drop-shadow-lg">Analytics</span>
            </h1>
            <p className="mt-3 text-white/90 text-lg sm:text-xl max-w-2xl drop-shadow-sm">
              Track your job postings and application statistics
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Job Posting Analysis
            </h1>
            <button 
              onClick={downloadPDF}
              disabled={generatingPDF || loading || error}
              className={`px-4 py-2 ${generatingPDF || loading || error ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} 
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
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 avoid-break-inside">
                  <div className="bg-white border border-gray-200 p-4 rounded-lg text-center shadow-sm">
                    <p className="text-lg font-semibold text-gray-800">Total Jobs</p>
                    <p className="text-2xl text-gray-800">{summaryData.totalJobCount}</p>
                  </div>
                  <div className="bg-white border border-gray-200 p-4 rounded-lg text-center shadow-sm">
                    <p className="text-lg font-semibold text-orange-500">Pending</p>
                    <p className="text-2xl text-orange-500">{summaryData.pendingJobCount}</p>
                  </div>
                  <div className="bg-white border border-gray-200 p-4 rounded-lg text-center shadow-sm">
                    <p className="text-lg font-semibold text-blue-500">Ongoing</p>
                    <p className="text-2xl text-blue-500">{summaryData.ongoingJobCount}</p>
                  </div>
                  <div className="bg-white border border-gray-200 p-4 rounded-lg text-center shadow-sm">
                    <p className="text-lg font-semibold text-green-500">Finished</p>
                    <p className="text-2xl text-green-500">{summaryData.finishedJobCount}</p>
                  </div>
                  <div className="bg-white border border-gray-200 p-4 rounded-lg text-center shadow-sm">
                    <p className="text-lg font-semibold text-red-500">Canceled</p>
                    <p className="text-2xl text-red-500">{summaryData.canceledJobCount}</p>
                  </div>
                </div>

                {/* Charts with reduced size */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 avoid-break-inside">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="h-64 md:h-80 mx-auto">
                      <Pie data={statusPieData} options={{...pieOptions, maintainAspectRatio: true}} />
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="h-64 md:h-80 mx-auto">
                      <Bar 
                        data={categoryBarData} 
                        options={{
                          ...barOptions,
                          maintainAspectRatio: true,
                          plugins: {
                            ...barOptions.plugins,
                            title: {
                              ...barOptions.plugins.title,
                              text: "Jobs by Category"
                            }
                          }
                        }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Location Distribution */}
                <div className="mb-8 avoid-break-inside">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="h-64 md:h-80 mx-auto">
                      <Bar 
                        data={locationBarData} 
                        options={{
                          ...barOptions,
                          maintainAspectRatio: true,
                          plugins: {
                            ...barOptions.plugins,
                            title: {
                              ...barOptions.plugins.title,
                              text: "Jobs by Location"
                            }
                          },
                          scales: {
                            ...barOptions.scales,
                            x: {
                              ...barOptions.scales.x,
                              title: {
                                ...barOptions.scales.x.title,
                                text: "Locations"
                              }
                            }
                          }
                        }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Most & Least Applied Jobs */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 avoid-break-inside">
                  {/* Most Applied Jobs */}
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Most Applied Jobs</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {summaryData.mostAppliedJobs.map((job) => (
                            <tr key={job.jobId}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                <a 
                                  href={`/e-job-details?jobId=${job.jobId}`} 
                                  className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  {job.jobTitle}
                                </a>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.applicationCount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Least Applied Jobs */}
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Least Applied Jobs</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {summaryData.leastAppliedJobs.map((job) => (
                            <tr key={job.jobId}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                <a 
                                  href={`/e-job-details?jobId=${job.jobId}`} 
                                  className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  {job.jobTitle}
                                </a>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.applicationCount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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

export default ESummary;