import './App.css';
import Signin from "./Components/Signin/Signin";
import Signup from "./Components/Signup/Signup";
import Otp from "./Components/OTP/Otp";
import Home from "./Components/Home/Home";
import Company from "./Components/Company/Company";
import JobDetails from "./Components/JobDetails/JobDetails";
import StudentProfile from "./Components/StudentProfile/StudentProfile";
import NavBar from "./Components/NavBar/NavBar";
import Activities from "./Components/Activities/Activities";
import Hero from "./Components/hero/Hero";
import ChatButton from "./Components/ChatButton/ChatButton";
import { Route, Routes, useLocation } from "react-router-dom";
import SearchBar from "./Components/SearchBar/SearchBar";


function App() {
    const location = useLocation();

    // List of routes that do NOT include the Navbar
    const noNavRoutes = ["/", "/hero", "/sign-in", "/sign-up", "/pin"];
    const chatButton=["/", "/hero", "/sign-in", "/sign-up", "/pin"];

    return (
        <div className="App">
            {/* Show Navbar only if the route is NOT in noNavRoutes */}
            {!chatButton.includes(location.pathname)&& <ChatButton/>}
            {!noNavRoutes.includes(location.pathname) && <NavBar />}
            <Routes>
                <Route path="/" element={<Hero />} />
                <Route path="/hero" element={<Hero />} />
                <Route path="/sign-in" element={<Signin />} />
                <Route path="/sign-up" element={<Signup />} />
                <Route path="/pin" element={<Otp/>}/>

                {/* Pages with NavBar */}
                <Route path="/home" element={<Home />} />
                <Route path="/company" element={<Company />} />
                <Route path="/profile" element={<StudentProfile />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/job-details" element={<JobDetails />} />
            </Routes>
        </div>
    );
}

export default App;


// import logo from './logo.svg';
// import './App.css';
// import Signin from "./Components/Signin/Signin";
// import Hero from "./Components/hero/Hero";
// import Signup from "./Components/Signup/Signup";
// import Otp from "./Components/OTP/Otp";
// import Home from "./Components/Home/Home";
// import Company from "./Components/Company/Company";
// import JobDetails from "./Components/JobDetails/JobDetails";
// import StudentProfile from "./Components/StudentProfile/StudentProfile";
// import { Route, Routes, useLocation } from "react-router-dom";
// import NavBar from "./Components/NavBar/NavBar";
// import Activities from "./Components/Activities/Activities";
//
// function App() {
//     const location = useLocation(); // Get the current route path
//     const hideNavBar = location.pathname === "/" || location.pathname === "/hero"; // Hide NavBar on Hero page
//
//     return (
//         <div className="App">
//             {!hideNavBar && <NavBar />} {/* Show NavBar only if not on Hero page */}
//
//             <Routes>
//                 <Route path="/" element={<Hero />} />
//                 <Route path="/hero" element={<Hero />} />
//                 <Route path="/sign-in" element={<Signin />} />
//                 <Route path="/home" element={<Home />} />
//                 <Route path="/company" element={<Company />} />
//                 <Route path="/profile" element={<StudentProfile />} />
//                 <Route path="/activities" element={<Activities />} />
//                 <Route path="/job-details" element={<JobDetails />} />
//             </Routes>
//         </div>
//     );
// }
//
// export default App;
