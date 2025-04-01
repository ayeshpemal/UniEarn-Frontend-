import React from "react";
import {useNavigate} from "react-router-dom";

const Admins = () => {
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <div>
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
                           Admin<br />
                            <span className="text-blue-400 drop-shadow-lg">Dashboard</span>
                        </h1>
                        <p className="mt-3 text-white/90 text-lg sm:text-xl max-w-2xl drop-shadow-sm">
                            Insights into platform performance and metrics
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Admin Management Dashboard
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Select a section to manage platform resources
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <button
                        onClick={() => handleNavigation('/a-company')}
                        className="bg-white shadow-lg hover:shadow-xl transition-all rounded-lg p-6 border border-gray-200 hover:border-blue-400 group"
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Manage Companies</h3>
                            <p className="mt-2 text-sm text-gray-600">Manage company accounts</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleNavigation('/a-student')}
                        className="bg-white shadow-lg hover:shadow-xl transition-all rounded-lg p-6 border border-gray-200 hover:border-blue-400 group"
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Manage Students</h3>
                            <p className="mt-2 text-sm text-gray-600">Manage student profiles</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleNavigation('/admin/stats')}
                        className="bg-white shadow-lg hover:shadow-xl transition-all rounded-lg p-6 border border-gray-200 hover:border-blue-400 group"
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Platform Statistics</h3>
                            <p className="mt-2 text-sm text-gray-600">View platform metrics and analytics</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleNavigation('/a-report')}
                        className="bg-white shadow-lg hover:shadow-xl transition-all rounded-lg p-6 border border-gray-200 hover:border-blue-400 group"
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition-colors">Report Management</h3>
                            <p className="mt-2 text-sm text-gray-600">Handle user reports and issues</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleNavigation('/a-notification')}
                        className="bg-white shadow-lg hover:shadow-xl transition-all rounded-lg p-6 border border-gray-200 hover:border-blue-400 group"
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">Send Notifications</h3>
                            <p className="mt-2 text-sm text-gray-600">Send notifications to users</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Admins;
