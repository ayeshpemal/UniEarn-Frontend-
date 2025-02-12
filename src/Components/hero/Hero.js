import React from "react";
import bgImage from "./bg.png"; // Import the background image

const Hero = () => {
    return (
        <div
            className="h-screen w-screen bg-cover bg-center bg-no-repeat relative"
            style={{ backgroundImage: `url(${bgImage})` }} // Reference the imported image
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white">
                <h1 className="text-5xl md:text-7xl font-bold">
                    We’re <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Hiring</span>
                </h1>
                <p className="mt-4 text-lg md:text-2xl font-medium">Small Jobs</p>

                {/* Buttons */}
                <div className="flex mt-8 space-x-4">
                    <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-semibold hover:opacity-90">
                        Sign In
                    </button>
                    <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg font-semibold hover:opacity-90">
                        Sign Up
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Hero;
