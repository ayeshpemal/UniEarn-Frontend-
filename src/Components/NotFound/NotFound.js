import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Not Found</h1>
            <p className="text-lg text-gray-600 mb-6">
                The page you're looking for doesn't exist or you don't have access to it.
            </p>
            <button
                onClick={() => navigate("/sign-in")}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
            >
                Go to Sign In
            </button>
        </div>
    );
};

export default NotFound;