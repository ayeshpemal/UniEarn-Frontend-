import React from "react";
import {NavLink} from "react-router-dom";
import { GraduationCap} from "lucide-react";

const NavBar = () =>{
    return(
        <div>

            <nav className="bg-black text-white p-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <GraduationCap size={24} className="text-white" />
                    <span className="text-xl font-bold">Uni Earn</span>
                </div>
                <div className="flex space-x-8 text-xl">
                    <NavLink to="/home" className="hover:underline cursor-pointer">Home</NavLink>
                    <NavLink to="/company" className="hover:underline cursor-pointer">Company</NavLink>
                    <NavLink to="/activities" className="hover:underline cursor-pointer">Activities</NavLink>
                    <NavLink to="/profile" className="hover:underline cursor-pointer">Profile</NavLink>
                    <NavLink to="#" className="hover:underline cursor-pointer">Contact</NavLink>
                    <NavLink to="#" className="hover:underline cursor-pointer text-red-400">Logout</NavLink>
                </div>
            </nav>
        </div>
    )
}

export default NavBar;