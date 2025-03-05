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
import Admins from "./Components/Admins/Admins";
import ESignin from "./Components/Employer/ESignin/ESignin";
import EHero from "./Components/Employer/EHero/EHero";
import EChatButton from "./Components/Employer/EChatButton/EChatButton";
import ENavBar from "./Components/Employer/ENavBar/ENavBar";
import EHeroSectionCompany from "./Components/Employer/EHeroSection/EHeroSectionCompany";
import EHeroSectionHome from "./Components/Employer/EHeroSection/EHeroSectionHome";
import ESignup from "./Components/Employer/ESignup/ESignup";
import EHome from "./Components/Employer/EHome/EHome";
import EJobCreation from "./Components/Employer/EJobCreation/EJobCreation";
import EJobUpdate from "./Components/Employer/EJobUpdate/EJobUpdate";
import AdminStats from "./Components/Admins/AdminStats/AdminStats";



function App() {
    const location = useLocation();
    // Student
    // List of routes that do NOT include the Navbar
    const noNavRoutes = ["/", "/hero", "/sign-in", "/sign-up", "/pin","/e-hero","/e-sign-in","/e-sign-up","/e-home","/e-job-create","/e-job-edit","/e-contact-us","/admins/stats"];
    const chatButton=["/", "/hero", "/sign-in", "/sign-up", "/pin","/e-hero","/e-sign-in","/e-sign-up","/e-home","/e-job-create","/e-job-edit","/e-contact-us","/admins/stats"];
    const searchBarHome=["/", "/hero", "/sign-in", "/sign-up", "/pin" ,"/company","/e-home",
        "/profile","/activities","/job-details","/apply-job","/contact-us","/company-rating","/e-hero","/e-sign-in","/e-sign-up","/e-job-create","/e-job-edit","/e-contact-us","/admins/stats"];
    const searchBarCompany=["/", "/hero", "/sign-in", "/sign-up" ,"/home","/profile","/e-home",
        "/activities","/job-details","/apply-job","/contact-us","/company-rating","/e-hero","/e-sign-in","/e-sign-up","/e-job-create","/e-job-edit","/e-contact-us","/admins/stats"];

    //Employer
    const eNoNavRoutes = ["/", "/home", "/hero", "/sign-in", "/sign-up", "/pin","/e-hero","/e-sign-in","/e-sign-up","/admins/stats"];
    const eChatButton=["/", "/home", "/hero", "/sign-in", "/sign-up", "/pin","/e-hero","/e-sign-in","/e-sign-up","/admins/stats"];
    const eSearchBarHome=["/", "/home", "/hero", "/sign-in", "/sign-up", "/pin" ,"/company",
        "/profile","/activities","/job-details","/apply-job","/contact-us","/company-rating","/e-hero","/e-sign-in","/e-sign-up","/e-job-create","/e-job-edit","/e-contact-us","/admins/stats"];
    const eSearchBarCompany=["/", "/home", "/hero", "/sign-in", "/sign-up" ,"/home","/profile","/e-home",
        "/activities","/job-details","/apply-job","/contact-us","/company-rating","/e-hero","/e-sign-in","/e-sign-up","/e-contact-us","/admins/stats"];


    return (
        <div className="App">

            {/*Show Navbar only if the route is NOT in noNavRoutes*/}
            {!eChatButton.includes(location.pathname)&& <EChatButton />}
            {!eNoNavRoutes.includes(location.pathname) && <ENavBar />}
            {!eSearchBarHome.includes(location.pathname) && <EHeroSectionHome />}
            {!eSearchBarCompany.includes(location.pathname) && <EHeroSectionCompany />}

            {!chatButton.includes(location.pathname)&& <ChatButton />}
            {!noNavRoutes.includes(location.pathname) && <NavBar />}
            {!searchBarHome.includes(location.pathname) && <HeroSectionHome />}
            {!searchBarCompany.includes(location.pathname) && <HeroSectionCompany />}

            {/*Show Navbar only if the route is NOT in noNavRoutes*/}

            <Routes>
                <Route path="/" element={<Admins />} />
                <Route path="/admins" element={<Admins />} />
                <Route path="/admins/stats" element={<AdminStats />} />

                {/*Employer*/}
                <Route path="/e-hero" element={<EHero />} />
                <Route path="/e-sign-in" element={<ESignin />} />
                <Route path="/e-sign-up" element={<ESignup />} />
                <Route path="/e-home" element={<EHome />} />
                <Route path="/e-job-create" element={<EJobCreation />} />
                <Route path="/e-job-edit" element={<EJobUpdate />} />
                <Route path="/e-contact-us" element={<ContactUs/>}/>


                {/*Students*/}
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
