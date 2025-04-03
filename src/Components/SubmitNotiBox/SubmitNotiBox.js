import React, { useState, useEffect } from 'react';

const SubmitNotiBox = ({ message, status, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(100);

  useEffect(() => {
    // Reset visibility and progress when a new message comes in
    setIsVisible(true);
    setTimeLeft(100);
    
    // Auto-hide the notification after the specified duration
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);
    
    // Update progress bar
    const interval = setInterval(() => {
      setTimeLeft(prevTime => {
        const decrement = 100 / (duration / 100);
        return Math.max(0, prevTime - decrement);
      });
    }, 100);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [message, status, duration]);

  if (!isVisible || !message) return null;

  const baseClasses = "fixed z-50 transition-all duration-300 flex flex-col shadow-md rounded-md overflow-hidden";
  
  // Responsive positioning and sizing
  const responsiveClasses = "sm:bottom-4 sm:left-4 sm:max-w-md bottom-0 left-0 right-0 sm:right-auto w-full sm:w-auto";
  
  // Responsive padding
  const paddingClasses = "px-4 sm:px-6 py-2 sm:py-3";
  
  const statusClasses = {
    success: "bg-green-100 border-l-4 border-green-500 text-green-700",
    error: "bg-red-100 border-l-4 border-red-500 text-red-700"
  };

  const iconClasses = {
    success: "mr-2 h-4 w-4 sm:h-5 sm:w-5 text-green-500",
    error: "mr-2 h-4 w-4 sm:h-5 sm:w-5 text-red-500"
  };

  const progressBarColors = {
    success: "bg-green-500",
    error: "bg-red-500"
  };

  return (
    <div 
      className={`${baseClasses} ${responsiveClasses} ${paddingClasses} ${statusClasses[status] || statusClasses.error}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center w-full">
        {status === 'success' ? (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses.success} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses.error} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )}
        <span className="text-xs sm:text-sm font-medium flex-grow">{message}</span>
        <button 
          onClick={() => setIsVisible(false)} 
          className="ml-auto -mr-1 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="Close notification"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Timeout Progress Bar */}
      <div className="w-full h-1 bg-gray-200 rounded-b-md mt-2 overflow-hidden">
        <div 
          className={`h-full ${progressBarColors[status] || progressBarColors.error} transition-all ease-linear`}
          style={{ width: `${timeLeft}%` }}
          role="progressbar"
          aria-valuenow={timeLeft}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
    </div>
  );
};

export default SubmitNotiBox;