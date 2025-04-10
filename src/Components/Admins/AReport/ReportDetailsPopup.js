import React from "react";

const ReportDetailsPopup = ({ 
  report, 
  onClose, 
  onResolve, 
  onReject, 
  actionLoading,
  formatDate 
}) => {
  // Status badge component with improved styling
  const StatusBadge = ({ status }) => {
    const badgeStyles = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'RESOLVED': 'bg-green-100 text-green-800 border-green-200',
      'REJECTED': 'bg-red-100 text-red-800 border-red-200'
    };
    
    const statusIcons = {
      'PENDING': (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'RESOLVED': (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      'REJECTED': (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    };
    
    return (
      <span className={`px-3 py-1.5 rounded-full text-sm font-medium border inline-flex items-center ${badgeStyles[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {statusIcons[status]}
        {status}
      </span>
    );
  };

  // Report Type information component
  const ReportTypeBadge = ({ reportType }) => {
    // Map report types to their penalty scores and descriptions
    const reportTypeInfo = {
      'Harassment_and_Safety_Issues': {
        penalty: 8,
        description: 'Sexual Harassment, Verbal Abuse, Threatening Behavior, etc.',
        color: 'bg-red-500'
      },
      'Fraud_and_Payment_Issues': {
        penalty: 7,
        description: 'Non-payment for Work, Delayed Payments, Payment Amount Disputes, etc.',
        color: 'bg-orange-500'
      },
      'Inappropriate_Content': {
        penalty: 6,
        description: 'Inappropriate Images/Videos, Offensive Language, Adult Content, etc.',
        color: 'bg-yellow-500'
      },
      'Identity_Misrepresentation': {
        penalty: 5,
        description: 'Fake Company/Business, False University Affiliation, Impersonating Another User, etc.',
        color: 'bg-indigo-500'
      },
      'Job_Misrepresentation': {
        penalty: 4,
        description: 'False Job Description, Hidden Job Requirements, Misleading Salary Information, etc.',
        color: 'bg-blue-500'
      },
      'Professional_Conduct_Issues': {
        penalty: 3,
        description: 'No-show at Work, Unprofessional Communication, Excessive Personal Questions, etc.',
        color: 'bg-cyan-500'
      },
      'Work_Environment_Concerns': {
        penalty: 2,
        description: 'Miscommunication, Schedule Conflicts, Task Completion Disagreements, etc.',
        color: 'bg-teal-500'
      },
      'Other': {
        penalty: 1,
        description: 'For any issues that don\'t fit into above categories',
        color: 'bg-gray-500'
      }
    };
    
    const info = reportTypeInfo[reportType] || {
      penalty: '-',
      description: 'Unknown report type',
      color: 'bg-gray-500'
    };
    
    const formattedType = reportType?.replace(/_/g, ' ') || 'Unknown';
    
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-800">{formattedType}</span>
          <span className={`${info.color} text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Penalty Score: {info.penalty}
          </span>
        </div>
        <p className="text-sm text-gray-600">{info.description}</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}  
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 rounded-t-xl flex justify-between items-center">
          <h3 className="text-xl font-medium text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Report #{report.reportId} Details
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none transition-colors duration-150"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 py-5">
          {/* Status Section */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Current Status</p>
              <div className="mt-1">
                <StatusBadge status={report.status} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 text-right">Report Date</p>
              <p className="mt-1 text-sm text-gray-900 flex items-center justify-end">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(report.reportDate)}
              </p>
            </div>
          </div>
          
          {/* Report Type Section - NEW */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-700 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h4 className="font-medium text-purple-700">Report Type</h4>
            </div>
            <ReportTypeBadge reportType={report.reportType} />
          </div>
          
          {/* Users Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="border-r-0 md:border-r border-gray-200 pr-0 md:pr-3">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h4 className="font-medium text-blue-700">Reporter Information</h4>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <p className="text-sm">
                  <span className="font-medium text-gray-700">User ID:</span> {report.reporter}
                </p>
              </div>
            </div>
            
            <div className="pl-0 md:pl-3">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h4 className="font-medium text-red-700">Reported User Information</h4>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <p className="text-sm">
                  <span className="font-medium text-gray-700">User ID:</span> {report.reportedUser}
                </p>
              </div>
            </div>
          </div>
          
          {/* Feedback Section */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <h4 className="font-medium text-gray-700">Feedback</h4>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{report.feedback || "No feedback provided."}</p>
            </div>
          </div>
        </div>
        
        {/* Footer with actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex flex-wrap justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Close
          </button>
          
          {report.status === "PENDING" && (
            <>
              <button 
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
                onClick={() => onReject(report.reportId)}
                disabled={actionLoading === report.reportId}
              >
                {actionLoading === report.reportId ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Reject Report
                  </>
                )}
              </button>
              
              <button 
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
                onClick={() => onResolve(report.reportId)}
                disabled={actionLoading === report.reportId}
              >
                {actionLoading === report.reportId ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Resolve Report
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetailsPopup;