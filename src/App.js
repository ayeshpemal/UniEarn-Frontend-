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
import ApplyJob from "./Components/ApplyJob/ApplyJob";
import HeroSectionHome from "./Components/HeroSection/HeroSectionHome";
import HeroSectionCompany from "./Components/HeroSection/HeroSectionCompany";
import ContactUs from "./Components/ContactUs/ContactUs";
import LogoutPopup from "./Components/LogoutPopup/LogoutPopup";
import CompanyRating from "./Components/CompanyRating/CompanyRating";


function App() {
    const location = useLocation();

    // List of routes that do NOT include the Navbar
    const noNavRoutes = ["/", "/hero", "/sign-in", "/sign-up", "/pin"];
    const chatButton=["/", "/hero", "/sign-in", "/sign-up", "/pin"];
    const searchBarHome=["/", "/hero", "/sign-in", "/sign-up", "/pin" ,"/company","/profile","/activities","/job-details","/apply-job","/contact-us","/company-rating"];
    const searchBarCompany=["/", "/hero", "/sign-in", "/sign-up" ,"/home","/profile","/activities","/job-details","/apply-job","/contact-us","/company-rating"];

    return (
        <div className="App">

            {/*Show Navbar only if the route is NOT in noNavRoutes*/}
            {!chatButton.includes(location.pathname)&& <ChatButton />}
            {!noNavRoutes.includes(location.pathname) && <NavBar />}
            {!searchBarHome.includes(location.pathname) && <HeroSectionHome />}
            {!searchBarCompany.includes(location.pathname) && <HeroSectionCompany />}
            <Routes>
                <Route path="/" element={<Hero />} />
                <Route path="/hero" element={<Hero />} />
                <Route path="/sign-in" element={<Signin />} />
                <Route path="/sign-up" element={<Signup />} />

                {/* Pages with NavBar */}
                <Route path="/home" element={<Home />} />
                <Route path="/company" element={<Company />} />
                <Route path="/profile" element={<StudentProfile />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/job-details" element={<JobDetails />} />
                <Route path="/apply-job" element={<ApplyJob />}/>
                <Route path="/contact-us" element={<ContactUs/>}/>
                <Route path="/log-out" element={<LogoutPopup/>}/>
                <Route path="/company-rating" element={<CompanyRating/>}/>

            </Routes>
        </div>
    );
}

export default App;
