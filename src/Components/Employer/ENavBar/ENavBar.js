import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    GraduationCap, Menu, X, Home, ListTodo, Building2, User, Phone, LogOut
} from "lucide-react";
import LogoutPopup from "../ELogoutPopup/ELogoutPopup"; // Import the Logout Popup

const ENavBar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [logoutPopup, setLogoutPopup] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        setLogoutPopup(false);  // Close popup
        localStorage.removeItem("token"); // Clear session (if using tokens)
        navigate("/e-sign-in"); // Redirect to Sign In page
    };

    return (
        <nav className="bg-gray-950/60 text-white p-4 fixed top-0 left-0 w-full z-50">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo Section */}
                <div className="flex items-center space-x-2">
                    <GraduationCap size={28} className="text-white" />
                    <span className="text-xl font-bold">Uni Earn</span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex space-x-6 text-lg">
                    <NavLink to="/e-home" className="hover:underline flex items-center gap-1">
                        <Home size={20} /> Home
                    </NavLink>
                    <NavLink to="/e-job-create" className="hover:underline flex items-center gap-1">
                        <Building2 size={18} /> Create Job
                    </NavLink>
                    <NavLink to="/e-profile" className="hover:underline flex items-center gap-1">
                        <User size={20} /> Profile
                    </NavLink>
                    <NavLink to="/e-contact-us" className="hover:underline flex items-center gap-1">
                        <Phone size={20} /> Contact
                    </NavLink>
                    <button
                        onClick={() => setLogoutPopup(true)}
                        className="hover:underline flex items-center gap-1 text-red-400"
                    >
                        <LogOut size={20} /> Logout
                    </button>
                </div>

                {/* Mobile Menu Icon */}
                <button className="md:hidden block text-white" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Slide-in Menu */}
            <div className={`fixed top-0 right-0 w-2/3 sm:w-1/2 h-full bg-black text-white transform transition-transform duration-300 ${menuOpen ? "translate-x-0" : "translate-x-full"} shadow-lg`}>
                {/* Close Button */}
                <button className="absolute top-4 right-4 text-white" onClick={() => setMenuOpen(false)}>
                    <X size={28} />
                </button>

                {/* Menu List */}
                <div className="flex flex-col items-center justify-center h-full space-y-6 text-lg">
                    <NavLink to="/e-home" className="hover:underline flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                        <Home size={24} /> Home
                    </NavLink>
                    <NavLink to="/e-company" className="hover:underline flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                        <Building2 size={18} /> Company
                    </NavLink>
                    <NavLink to="/e-activities" className="hover:underline flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                        <ListTodo size={18} /> Activities
                    </NavLink>
                    <NavLink to="/e-profile" className="hover:underline flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                        <User size={24} /> Profile
                    </NavLink>
                    <NavLink to="/e-contact-us" className="hover:underline flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                        <Phone size={24} /> Contact
                    </NavLink>
                    <button
                        onClick={() => {
                            setMenuOpen(false);
                            setLogoutPopup(true);
                        }}
                        className="hover:underline flex items-center gap-2 text-red-400"
                    >
                        <LogOut size={24} /> Logout
                    </button>
                </div>
            </div>

            {/* Logout Confirmation Popup */}
            <LogoutPopup
                isOpen={logoutPopup}
                onClose={() => setLogoutPopup(false)}
                onConfirm={handleLogout}
            />
        </nav>
    );
};

export default ENavBar;
