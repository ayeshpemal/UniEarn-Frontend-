import './App.css';
import Signin from "./Components/Signin/Signin";
import Signup from "./Components/Signup/Signup";
import Home from "./Components/Home/Home";
import CompanyList from "./Components/CompanyList/CompanyList";
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
import Admins from "./Components/Admins/Admins";
import ESignin from "./Components/Employer/ESignin/ESignin";
import EHero from "./Components/Employer/EHero/EHero";
import EChatButton from "./Components/Employer/EChatButton/EChatButton";
import ENavBar from "./Components/Employer/ENavBar/ENavBar";
import EHeroSectionCompany from "./Components/Employer/EHeroSection/EHeroSectionCompany";
import EHeroSectionHome from "./Components/Employer/EHeroSection/EHeroSectionHome";
import ESignup from "./Components/Employer/ESignup/ESignup";
import EHome from "./Components/Employer/EHome/EHome";
import SearchResults from "./Components/SearchResults/SearchResults";
import EJobCreation from "./Components/Employer/EJobCreation/EJobCreation";
import EJobUpdate from "./Components/Employer/EJobUpdate/EJobUpdate";
import CompanyDetails from './Components/Employer/CompanyDetails/CompanyDetails';
import AdminStats from "./Components/Admins/AdminStats/AdminStats";
import Application from './Components/Application/Application';
import JobPreferences from "./Components/JobPreferences/JobPreferences";
import SearchStudent from "./Components/SearchStudent/SearchStudent";
import SearchEmployer from "./Components/SearchEmployer/SearchEmployer";
import StudentSummary from "./Components/StudentSummary/StudentSummary";
import ResetPassword from "./Components/ResetPassword/ResetPassword";

function App() {
    const location = useLocation();
    // Student
    // List of routes that do NOT include the Navbar
    const noNavRoutes = [
        "/", "/hero", "/sign-in", "/sign-up", "/pin", "/verify", "/e-hero", "/e-sign-in", "/e-sign-up", 
        "/e-home", "/e-job-create", "/e-job-edit", "/e-contact-us", "/admins/stats", "/reset-password",
        "/e-profile"
    ];
    
    const chatButton = [
        "/", "/hero", "/sign-in", "/sign-up", "/pin", "/verify", "/e-hero", "/e-sign-in", "/e-sign-up", 
        "/e-home", "/e-job-create", "/e-job-edit", "/e-contact-us", "/admins/stats", "/reset-password",
        "/e-profile"
    ];
    
    const searchBarHome = [
        "/", "/hero", "/sign-in", "/sign-up", "/pin", "/verify", "/company", "/e-home", "/profile", 
        "/activities", "/job-details", "/apply-job", "/contact-us", "/company-rating", "/e-hero", 
        "/e-sign-in", "/e-sign-up", "/e-job-create", "/e-job-edit", "/e-contact-us", "/admins/stats", 
        "/search-student", "/activities/summary", "/reset-password", "/home","/e-profile"
    ];
    
    const searchBarCompany = [
        "/", "/hero", "/sign-in", "/sign-up", "/home", "/profile", "/verify", "/e-home", "/activities", 
        "/job-details", "/apply-job", "/contact-us", "/company-rating", "/e-hero", "/e-sign-in", 
        "/e-sign-up", "/e-job-create", "/e-job-edit", "/e-contact-us", "/admins/stats", "/search-student", 
        "/company", "/activities/summary", "/reset-password","/e-profile"
    ];
    
    // Employer Routes
    const eNoNavRoutes = [
        "/", "/home", "/hero", "/sign-in", "/sign-up", "/pin", "/verify", "/e-hero", "/e-sign-in", 
        "/e-sign-up", "/admins/stats", "/company", "/activities", "/profile", "/contact-us", 
        "/search-student", "/job-details", "/activities/summary", "/reset-password"
    ];
    
    const eChatButton = [
        "/", "/home", "/hero", "/sign-in", "/sign-up", "/pin", "/verify", "/e-hero", "/e-sign-in", 
        "/e-sign-up", "/admins/stats", "/company", "/activities", "/profile", "/contact-us", 
        "/search-student", "/job-details", "/activities/summary", "/reset-password"
    ];
    
    const eSearchBarHome = [
        "/", "/home", "/hero", "/sign-in", "/sign-up", "/pin", "/verify", "/company", "/profile", 
        "/activities", "/job-details", "/apply-job", "/contact-us", "/company-rating", "/e-hero", 
        "/e-sign-in", "/e-sign-up", "/e-contact-us", "/admins/stats", "/company", "/activities", 
        "/search-student", "/job-details", "/activities/summary", "/reset-password","/e-profile"
    ];
    
    const eSearchBarCompany = [
        "/", "/home", "/hero", "/sign-in", "/sign-up", "/home", "/profile", "/verify", "/e-home", 
        "/activities", "/job-details", "/apply-job", "/contact-us", "/company-rating", "/e-hero", 
        "/e-sign-in", "/e-sign-up", "/e-contact-us", "/admins/stats", "/company", "/activities", 
        "/profile", "/search-student", "/job-details", "/e-job-create", "/e-job-edit", "/activities/summary", "/reset-password"
    ];
    

    return (
        <div className="App">

            {/*Show Navbar only if the route is NOT in noNavRoutes*/}
            {!eChatButton.includes(location.pathname)&& <ChatButton />}
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
                <Route path="/e-profile" element={<CompanyDetails />} />
                <Route path="/e-contact-us" element={<ContactUs/>}/>

                {/*Students*/}
                <Route path="/hero" element={<Hero />} />
                <Route path="/sign-in" element={<Signin />} />
                <Route path="/sign-up" element={<Signup />} />
                <Route path="/verify" element={<JobPreferences />} />
                <Route path="/searched-results/:selectedLocation/:selectedJob/:searchTerm" element={<SearchResults />} />

                {/* Pages with NavBar */}
                <Route path="/home" element={<Home />} />
                <Route path="/companyList" element={<CompanyList />} />
                <Route path="/verify/:userid" element={<JobPreferences />} />
                <Route path='/search-student' element={<SearchStudent/>} />
                <Route path="/activities/summary" element={<StudentSummary />} />

                {/* Pages with NavBar */}
                <Route path="/home" element={<Home />} />
                <Route path="/company" element={<SearchEmployer />} />
                <Route path="/profile" element={<StudentProfile />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/confirm" element={<Application />} /> 
                <Route path="/job-details" element={<JobDetails />} />
                <Route path="/job-details/:jobId" element={<JobDetails />} />
                <Route path="/apply-job" element={<ApplyJob />}/>
                <Route path="/contact-us" element={<ContactUs/>}/>
                <Route path="/log-out" element={<LogoutPopup/>}/>
                <Route path="/reset-password" element={<ResetPassword/>}/>
                <Route path="/company-details/:employerId" element={<CompanyDetails/>}/>

            </Routes>
        </div>
    );
}

export default App;
