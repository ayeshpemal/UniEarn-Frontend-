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
import Admins from "./Components/Admins/AHome/Admins";
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
import ANavBar from "./Components/Admins/ANavBar/ANavBar";
import Footer from './Components/Footer/Footer';
import AProfile from './Components/Admins/AProfile/AProfile';
import ASearchEmployer from './Components/Admins/ASearchEmployer/ASearchEmployer';
import ASearchStudent from './Components/Admins/ASearchStudent/ASearchStudent';
import Landing from './Components/Landing/Landing';
import EJobApplications from './Components/Employer/EJobApplications/EJobApplications';
import ESummary from './Components/Employer/ESummary/ESummary';
import AReport from './Components/Admins/AReport/AReport';
import ANotification from './Components/Admins/ANotification/ANotification';
import ManageAdmin from './Components/Admins/ManageAdmin/ManageAdmin';
import CreateUsers from './Components/Admins/CreateUsers/CreateUsers';

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
        "/search-student", "/activities/summary", "/reset-password", "/home", "/e-profile","/e-summary",
        "/p-contact-us","/a-home","/admin/stats","/a-profile","/a-company","/a-student","/a-report",
        "/a-notification","/e-job-details","/create-users1219"
    ];
    
    const searchBarCompany = [
        "/", "/hero", "/sign-in", "/sign-up", "/home", "/profile", "/verify", "/e-home", "/activities", 
        "/job-details", "/apply-job", "/contact-us", "/company-rating", "/e-hero", "/e-sign-in", 
        "/e-sign-up", "/e-job-create", "/e-job-edit", "/e-contact-us", "/admins/stats", "/search-student", 
        "/company", "/activities/summary", "/reset-password", "/e-profile","/e-summary","/p-contact-us",
        "/a-home","/admin/stats","/a-profile","/a-company","/a-student","/a-report","/a-notification",
        "/e-job-details","/create-users1219"
    ];

    const eChatButton = [
        "/", "/home", "/hero", "/sign-in", "/sign-up", "/pin", "/verify", "/e-hero", "/e-sign-in", 
        "/e-sign-up", "/admins/stats", "/company", "/activities", "/profile", "/contact-us", 
        "/search-student", "/job-details", "/activities/summary", "/reset-password"
    ];
    
    const eSearchBarHome = [
        "/", "/home", "/hero", "/sign-in", "/sign-up", "/pin", "/verify", "/company", "/profile", 
        "/activities", "/job-details", "/apply-job", "/contact-us", "/company-rating", "/e-hero", 
        "/e-sign-in", "/e-sign-up", "/e-contact-us", "/admins/stats", , "/activities", 
        "/search-student", "/job-details", "/activities/summary", "/reset-password", "/e-profile",
        "/e-summary","/p-contact-us","/a-home","/admin/stats","/a-profile","/a-company","/a-student",
        "/a-report","/a-notification","/e-job-details","/create-users1219"
    ];
    
    const eSearchBarCompany = [
        "/", "/home", "/hero", "/sign-in", "/sign-up", "/home", "/profile", "/verify", "/e-home", 
        "/activities", "/job-details", "/apply-job", "/contact-us", "/company-rating", "/e-hero", 
        "/e-sign-in", "/e-sign-up", "/e-contact-us", "/admins/stats", "/company", "/activities", 
        "/profile", "/search-student", "/job-details", "/e-job-create", "/e-job-edit", "/activities/summary", 
        "/reset-password","/e-profile","/e-summary","/p-contact-us","/a-home","/admin/stats","/a-profile",
        "/a-company","/a-student","/a-report","/a-notification","/e-job-details","/create-users1219"

    ];

    // Define all valid routes explicitly
    const validRoutes = [
        "/", "/hero", "/sign-in", "/sign-up", "/e-sign-in", "/e-sign-up", "/e-hero",
        "/verify", "/reset-password", "/admins", "/admins/stats", "/e-home",
        "/e-job-create", "/e-job-edit", "/e-profile", "/e-contact-us", "/home",
        "/search-student", "/activities/summary", "/company","/profile", "/activities", 
        "/job-details", "/apply-job","/contact-us", "/log-out","/p-contact-us","/a-home",
        "/admin/stats","/a-profile","/a-company","/a-student","/a-report","/a-notification",
        "/e-job-details","/e-summary","/create-users1219"
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
        "/e-hero", "/e-sign-up", "/sign-in", 
        "/verify", "/sign-up", "/reset-password", "/hero",
        "/","/contact-us"
    ];

    const isPublicRoute = publicRoutes.includes(location.pathname);

    // Updated role-based ProtectedRoute component
    const ProtectedRoute = ({ children, redirectTo = "/sign-in", allowedRoles = null }) => {
        if (loading) {
            return <div>Loading...</div>;
        }
    
        // Check if user is authenticated
        if (!isAuthenticated && !isPublicRoute) {
            console.log('Redirecting to sign-in. Auth:', isAuthenticated, 'Public:', isPublicRoute);
            return <Navigate to={redirectTo} replace />;
        }
    
        // If allowedRoles is specified, check if user has permission
        if (isAuthenticated && allowedRoles && !allowedRoles.includes(userRole)) {
            console.log(`Access denied. User role ${userRole} not in allowed roles:`, allowedRoles);
            return <NotFound />; // Show NotFound instead of redirecting
        }
    
        return children;
    };

    return (
        <div className="App">
            {/* ChatButton and NavBar logic */}
            {!isPublicRoute && isAuthenticated && <ChatButton />}
            {!isPublicRoute && isAuthenticated && (
                userRole === 'STUDENT' ? <NavBar /> : 
                userRole === 'EMPLOYER' ? <ENavBar /> :
                userRole === 'ADMIN' ? <ANavBar /> : null
            )}

            {/* Render HeroSections only on valid routes */}
            {isValidRoute && !eSearchBarHome.includes(location.pathname) && <EHeroSectionHome />}
            {isValidRoute && !eSearchBarCompany.includes(location.pathname) && <EHeroSectionCompany />}
            {isValidRoute && !searchBarHome.includes(location.pathname) && <HeroSectionHome />}
            {isValidRoute && !searchBarCompany.includes(location.pathname) && <HeroSectionCompany />}

            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/hero" element={<Hero />} />
                <Route path="/e-hero" element={<EHero />} />
                <Route path="/sign-in" element={<Signin />} />
                <Route path="/sign-up" element={<Signup />} />
                <Route path="/e-sign-up" element={<ESignup />} />
                <Route path="/verify" element={<JobPreferences />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/contact-us" element={<ContactUs />} />

                {/* Admin Protected Routes - Only ADMIN can access */}
                <Route path="/a-home" element={<ProtectedRoute allowedRoles={['ADMIN']}><Admins /></ProtectedRoute>} />
                <Route path="/admin/stats" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminStats /></ProtectedRoute>} />
                <Route path="/a-profile" element={<ProtectedRoute allowedRoles={['ADMIN']}><AProfile /></ProtectedRoute>} />
                <Route path="/a-company" element={<ProtectedRoute allowedRoles={['ADMIN']}><ASearchEmployer /></ProtectedRoute>} />
                <Route path="/a-student" element={<ProtectedRoute allowedRoles={['ADMIN']}><ASearchStudent /></ProtectedRoute>} />
                <Route path="/a-admins" element={<ProtectedRoute allowedRoles={['ADMIN']}><ManageAdmin /></ProtectedRoute>} />
                <Route path="/a-report" element={<ProtectedRoute allowedRoles={['ADMIN']}><AReport /></ProtectedRoute>} />
                <Route path="/a-notification" element={<ProtectedRoute allowedRoles={['ADMIN']}><ANotification /></ProtectedRoute>} />
                <Route path="/create-users1219" element={<ProtectedRoute allowedRoles={['ADMIN']}><CreateUsers /></ProtectedRoute>} />
                
                {/* Employer Protected Routes - Only EMPLOYER can access (except e-profile) */}
                <Route path="/e-home" element={<ProtectedRoute allowedRoles={['EMPLOYER']}><EHome /></ProtectedRoute>} />
                <Route path="/e-job-create" element={<ProtectedRoute allowedRoles={['EMPLOYER']}><EJobCreation /></ProtectedRoute>} />
                <Route path="/e-job-edit" element={<ProtectedRoute allowedRoles={['EMPLOYER']}><EJobUpdate /></ProtectedRoute>} />
                <Route path="/e-profile" element={<ProtectedRoute><CompanyDetails /></ProtectedRoute>} />
                <Route path="e-job-details" element={<ProtectedRoute allowedRoles={['EMPLOYER']}><EJobApplications /></ProtectedRoute>} />
                <Route path="/e-summary" element={<ProtectedRoute allowedRoles={['EMPLOYER']}><ESummary /></ProtectedRoute>} />

                {/* Student Protected Routes - Only STUDENT can access (except profile and contact-us) */}
                <Route path="/home" element={<ProtectedRoute allowedRoles={['STUDENT']}><Home /></ProtectedRoute>} />
                <Route path="/search-student" element={<ProtectedRoute allowedRoles={['STUDENT']}><SearchStudent /></ProtectedRoute>} />
                <Route path="/activities/summary" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentSummary /></ProtectedRoute>} />
                <Route path="/company" element={<ProtectedRoute allowedRoles={['STUDENT']}><SearchEmployer /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
                <Route path="/activities" element={<ProtectedRoute allowedRoles={['STUDENT']}><Activities /></ProtectedRoute>} />
                <Route path="/job-details" element={<ProtectedRoute allowedRoles={['STUDENT']}><JobDetails /></ProtectedRoute>} />
                <Route path="/p-contact-us" element={<ProtectedRoute><ContactUs /></ProtectedRoute>} />
                <Route path="/log-out" element={<ProtectedRoute><LogoutPopup /></ProtectedRoute>} />

                {/* Catch-all Route for Not Found */}
                <Route path="*" element={<NotFound />} />
            </Routes>

            {!isPublicRoute && isAuthenticated && <Footer />}
        </div>
    );
}

export default App;