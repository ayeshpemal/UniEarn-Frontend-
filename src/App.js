import logo from './logo.svg';
import './App.css';
import Signin from "./Components/Signin/Signin";
import Hero from "./Components/hero/Hero";
import Signup from "./Components/Signup/Signup";
import Otp from "./Components/OTP/Otp";
import Home from "./Components/Home/Home";
import Company from "./Components/Company/Company";
import JobDetails from "./Components/JobDetails/JobDetails";
import StudentProfile from "./Components/StudentProfile/StudentProfile";
import {Route, Router, Routes} from "react-router-dom";
import NavBar from "./Components/NavBar/NavBar";
import Activities from "./Components/Activities/Activities";
function App() {
  return (
    <div className="App">
        {/*<Signup/>*/}
        {/*<Home/>*/}
        {/*<Otp/>*/}
        {/*<Signin/>*/}
        {/*<Hero/>*/}
        {/*<JobDetails/>*/}
        {/*<Company/>*/}
        {/*<StudentProfile/>*/}
        {/*<Activities/>*/}
        <NavBar/>
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/home" element={<Home/>}/>

            <Route path="/company" element={<Company/>}/>
            <Route path="/profile" element={<StudentProfile/>}/>
            <Route path="/activities" element={<Activities/>}/>
            <Route path="/job-details" element={<JobDetails/>}/>

        </Routes>

    </div>
  );
}

export default App;
