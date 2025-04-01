import React from "react";
import {useNavigate} from "react-router-dom"; // Import the background image

const Admins = () => {

    return (
        <div>
            {/* Hero Section */}
      <div>
      <header
        className="relative flex flex-col justify-center items-center text-white text-align h-[70vh] bg-cover bg-center px-6"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80")' }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            Platform <br />
            <span className="text-blue-400">Statistics</span>
          </h1>
        </div>
      </header>
    </div>
        </div>
    );
};

export default Admins;
