import { Star, Check } from "lucide-react";

const Student = ({ 
  student, 
  onConfirm, 
  isConfirmed, 
  status, 
  disabled, 
  onStudentClick,
  showFeedbackButton,
  onFeedbackClick 
}) => {
  // Check if job is finished and student has been rated
  const isFinishedAndRated = student.jobStatus === "FINISH" && student.rated;
  
  return (
    <section className="container mx-auto px-2 sm:px-4 mb-6 sm:mb-8">
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow">
        <h2 className="text-lg sm:text-xl font-bold mb-4">
          {student.name}
          {status === "CONFIRMED" && <span className="ml-2 text-green-600">(Confirmed)</span>}
          {status === "ACCEPTED" && <span className="ml-2 text-blue-600">(Accepted)</span>}
        </h2>
        
        {/* Table wrapper with overflow handling for mobile */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full mb-4">
            <thead className="hidden sm:table-header-group">
              <tr className="text-left border-b">
                <th className="pb-2 pl-4 sm:pl-0">Name</th>
                <th className="pb-2">Location</th>
                <th className="pb-2">Rate</th>
                {(showFeedbackButton || isFinishedAndRated) && <th className="pb-2">Action</th>}
              </tr>
            </thead>
            
            {/* Mobile view: Card-like layout */}
            <tbody className="block sm:table-row-group">
              <tr className="border-b block sm:table-row">
                {/* Name cell - full width on mobile */}
                <td className="py-3 pl-4 sm:pl-0 block sm:table-cell">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:text-purple-700" 
                    onClick={() => onStudentClick(student.studentId)}
                  >
                    <img
                      src={student.avatar || "/placeholder.svg"}
                      alt={`${student.name}'s avatar`}
                      className="h-10 w-10 rounded-full hover:ring-2 hover:ring-purple-400 transition-all"
                    />
                    <span className="hover:underline">{student.name}</span>
                  </div>
                  
                  {/* Mobile only - location */}
                  <div className="sm:hidden mt-2 text-sm text-gray-600">
                    <span className="font-medium">Location:</span> {student.location}
                  </div>
                  
                  {/* Mobile only - rating */}
                  <div className="sm:hidden mt-1 flex items-center">
                    <span className="font-medium text-sm mr-2">Rating:</span>
                    <div className="flex">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          className={`h-3 w-3 ${
                            index < student.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Mobile only - rating status */}
                  {isFinishedAndRated && (
                    <div className="sm:hidden mt-2 flex items-center text-green-600">
                      <Check className="h-4 w-4 mr-1" />
                      <span className="text-xs font-medium">Feedback provided</span>
                    </div>
                  )}
                </td>
                
                {/* Location - hidden on mobile */}
                <td className="py-3 text-gray-700 hidden sm:table-cell">
                  {student.location}
                </td>
                
                {/* Rating - hidden on mobile */}
                <td className="py-3 hidden sm:table-cell">
                  <div className="flex">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${
                          index < student.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </td>
                
                {/* Feedback button or rated indicator */}
                {(showFeedbackButton || isFinishedAndRated) && (
                  <td className="py-3 block sm:table-cell mt-3 sm:mt-0">
                    {showFeedbackButton && !student.rated ? (
                      <button 
                        onClick={onFeedbackClick}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-all duration-200 w-full sm:w-auto justify-center sm:justify-start"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                        </svg>
                        Give Feedback
                      </button>
                    ) : isFinishedAndRated && (
                      <div className="hidden sm:flex items-center bg-green-50 text-green-600 px-3 py-1.5 rounded-md text-sm">
                        <Check className="h-4 w-4 mr-1" />
                        <span className="font-medium">Feedback provided</span>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Confirm button stays at the bottom */}
        {!isConfirmed && (
          <div className="flex">
            <button
              onClick={onConfirm}
              disabled={disabled}
              className="bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

Student.defaultProps = {
  student: {},
  isConfirmed: false,
  status: "PENDING",
  onConfirm: () => {},
  disabled: false,
  onStudentClick: () => {},
  showFeedbackButton: false,
  onFeedbackClick: () => {}
};

export default Student;