import './App.css';
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from 'react';
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
import NotFound from "./Components/NotFound/NotFound";


function App() {
    const location = useLocation();
    const [userRole, setUserRole] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Original HeroSection arrays
    const chatButton = [
        "/", "/hero", "/sign-in", "/sign-up", "/pin", "/verify", "/e-hero", "/e-sign-in", "/e-sign-up", 
        "/e-home", "/e-job-create", "/e-job-edit", "/e-contact-us", "/admins/stats", "/reset-password",
        "/e-profile"
    ];
    
    const searchBarHome = [
        "/", "/hero", "/sign-in", "/sign-up", "/pin", "/verify", "/company", "/e-home", "/profile", 
        "/activities", "/job-details", "/apply-job", "/contact-us", "/company-rating", "/e-hero", 
        "/e-sign-in", "/e-sign-up", "/e-job-create", "/e-job-edit", "/e-contact-us", "/admins/stats", 
        "/search-student", "/activities/summary", "/reset-password", "/home", "/e-profile"
    ];
    
    const searchBarCompany = [
        "/", "/hero", "/sign-in", "/sign-up", "/home", "/profile", "/verify", "/e-home", "/activities", 
        "/job-details", "/apply-job", "/contact-us", "/company-rating", "/e-hero", "/e-sign-in", 
        "/e-sign-up", "/e-job-create", "/e-job-edit", "/e-contact-us", "/admins/stats", "/search-student", 
        "/company", "/activities/summary", "/reset-password", "/e-profile"
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
        "/search-student", "/job-details", "/activities/summary", "/reset-password", "/e-profile"
    ];
    
    const eSearchBarCompany = [
        "/", "/home", "/hero", "/sign-in", "/sign-up", "/home", "/profile", "/verify", "/e-home", 
        "/activities", "/job-details", "/apply-job", "/contact-us", "/company-rating", "/e-hero", 
        "/e-sign-in", "/e-sign-up", "/e-contact-us", "/admins/stats", "/company", "/activities", 
        "/profile", "/search-student", "/job-details", "/e-job-create", "/e-job-edit", "/activities/summary", "/reset-password"
    ];

    // Define all valid routes explicitly
    const validRoutes = [
        "/", "/hero", "/sign-in", "/sign-up", "/e-sign-in", "/e-sign-up", "/e-hero",
        "/verify", "/reset-password", "/admins", "/admins/stats", "/e-home",
        "/e-job-create", "/e-job-edit", "/e-profile", "/e-contact-us", "/home",
        "/companyList", "/search-student", "/activities/summary", "/company",
        "/profile", "/activities", "/confirm", "/job-details", "/apply-job",
        "/contact-us", "/log-out", "/company-details/:employerId",
        "/searched-results/:selectedLocation/:selectedJob/:searchTerm"
    ];

    // Check if the current path is valid (simplified check, ignoring params for now)
    const isValidRoute = validRoutes.some(route => {
        if (route.includes(":")) {
            // Handle dynamic routes by checking the base path
            const baseRoute = route.split(":")[0];
            return location.pathname.startsWith(baseRoute);
        }
        return route === location.pathname;
    });

    useEffect(() => {
        const checkToken = () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            console.log('Token from localStorage:', token);
            
            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    console.log('Decoded token:', decodedToken);
                    
                    const currentTime = Math.floor(Date.now() / 1000);
                    console.log('Current time:', currentTime);
                    console.log('Token exp:', decodedToken.exp);

                    if (decodedToken.exp < currentTime) {
                        console.log('Token expired');
                        localStorage.removeItem('token');
                        setIsAuthenticated(false);
                        setUserRole(null);
                    } else {
                        console.log('Token valid');
                        setIsAuthenticated(true);
                        setUserRole(decodedToken.role);
                    }
                } catch (error) {
                    console.error('Error decoding token:', error);
                    setIsAuthenticated(false);
                    setUserRole(null);
                    localStorage.removeItem('token');
                }
            } else {
                console.log('No token found');
                setIsAuthenticated(false);
                setUserRole(null);
            }
            setLoading(false);
        };

        checkToken();
    }, [location.pathname]);

    const publicRoutes = [
        "/e-hero", "/e-sign-in", "/e-sign-up", "/sign-in", 
        "/verify", "/sign-up", "/reset-password", "/hero",
        "/"
    ];

    const isPublicRoute = publicRoutes.includes(location.pathname);

    const ProtectedRoute = ({ children, redirectTo = "/sign-in" }) => {
        if (loading) {
            return <div>Loading...</div>;
        }

        if (!isAuthenticated && !isPublicRoute) {
            console.log('Redirecting to sign-in. Auth:', isAuthenticated, 'Public:', isPublicRoute);
            return <Navigate to={redirectTo} replace />;
        }
        return children;
    };

    return (
        <div className="App">
            {/* ChatButton and NavBar logic */}
            {!isPublicRoute && <ChatButton />}
            {!isPublicRoute && isAuthenticated && (
                userRole === 'STUDENT' ? <NavBar /> : 
                userRole === 'EMPLOYER' ? <ENavBar /> : null
            )}

            {/* Render HeroSections only on valid routes */}
            {isValidRoute && !eSearchBarHome.includes(location.pathname) && <EHeroSectionHome />}
            {isValidRoute && !eSearchBarCompany.includes(location.pathname) && <EHeroSectionCompany />}
            {isValidRoute && !searchBarHome.includes(location.pathname) && <HeroSectionHome />}
            {isValidRoute && !searchBarCompany.includes(location.pathname) && <HeroSectionCompany />}

            <Routes>
                {/* Public Routes */}
                <Route path="/hero" element={<Hero />} />
                <Route path="/sign-in" element={<Signin />} />
                <Route path="/sign-up" element={<Signup />} />
                <Route path="/e-sign-in" element={<ESignin />} />
                <Route path="/e-sign-up" element={<ESignup />} />
                <Route path="/e-hero" element={<EHero />} />
                <Route path="/verify" element={<JobPreferences />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/" element={<Admins />} />

                {/* Protected Routes */}
                <Route path="/admins" element={<ProtectedRoute><Admins /></ProtectedRoute>} />
                <Route path="/admins/stats" element={<ProtectedRoute><AdminStats /></ProtectedRoute>} />
                
                {/* Employer Protected Routes */}
                <Route path="/e-home" element={<ProtectedRoute><EHome /></ProtectedRoute>} />
                <Route path="/e-job-create" element={<ProtectedRoute><EJobCreation /></ProtectedRoute>} />
                <Route path="/e-job-edit" element={<ProtectedRoute><EJobUpdate /></ProtectedRoute>} />
                <Route path="/e-profile" element={<ProtectedRoute><CompanyDetails /></ProtectedRoute>} />
                <Route path="/e-contact-us" element={<ProtectedRoute><ContactUs /></ProtectedRoute>} />

                {/* Student Protected Routes */}
                <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/companyList" element={<ProtectedRoute><CompanyList /></ProtectedRoute>} />
                <Route path="/search-student" element={<ProtectedRoute><SearchStudent /></ProtectedRoute>} />
                <Route path="/activities/summary" element={<ProtectedRoute><StudentSummary /></ProtectedRoute>} />
                <Route path="/company" element={<ProtectedRoute><SearchEmployer /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
                <Route path="/activities" element={<ProtectedRoute><Activities /></ProtectedRoute>} />
                <Route path="/confirm" element={<ProtectedRoute><Application /></ProtectedRoute>} />
                <Route path="/job-details" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
                <Route path="/apply-job" element={<ProtectedRoute><ApplyJob /></ProtectedRoute>} />
                <Route path="/contact-us" element={<ProtectedRoute><ContactUs /></ProtectedRoute>} />
                <Route path="/log-out" element={<ProtectedRoute><LogoutPopup /></ProtectedRoute>} />
                <Route path="/company-details/:employerId" element={<ProtectedRoute><CompanyDetails /></ProtectedRoute>} />
                <Route path="/searched-results/:selectedLocation/:selectedJob/:searchTerm" 
                    element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />

                {/* Catch-all Route for Not Found */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    );
}

export default App;