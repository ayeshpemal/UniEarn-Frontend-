import React from "react";
import "./signin.css";
import {useNavigate} from "react-router-dom";
import {GraduationCap} from "lucide-react";

const Signin = () => {

    const navigate = useNavigate();
    const onNavigateToHomePage = () => {
      navigate("/home");
    }
    const onNavigateToSignUpPage = () => {
      navigate("/sign-up")
    }

    return (
        <div className="signin-container">
            {/* Top-Left Logo, Title, and Text */}
            <header className="header">
                <div className="flex items-center space-x-2">
                    <GraduationCap size={50} className="text-white" />
                    <span className="text-4xl font-bold">Uni Earn</span>
                </div>

                <div className="top-left-text">
                    <p>SIGN IN TO YOUR</p>
                    <p className="highlight">ADVENTURE!</p>
                </div>
            </header>

            {/* Background Overlay */}
            <div className="background-overlay">
                {/* Login Form */}
                <div className="login-form">
                    <h2>SIGN IN </h2>
                    <p>Sign in with your university email address </p>
                    <form>
                        <select className="form-input" required>
                            <option value="" >
                                Choose Your University
                            </option>
                            <option value="university of Colombo">University of Colombo</option>
                            <option value="university of Peradeniya">University of Peradeniya</option>
                            <option value="university of Sri Jayewardenepura">University of Sri Jayewardenepura</option>
                            <option value="university of Kelaniya">University of Kelaniya</option>
                            <option value="university of Moratuwa">University of Moratuwa</option>
                            <option value="university of Jaffna">University of Jaffna</option>
                            <option value="university of Ruhuna">University of Ruhuna</option>
                            <option value="The Open University of Sri Lanka">The Open University of Sri Lanka</option>
                            <option value="Eastern University, Sri Lanka">Eastern University, Sri Lanka</option>
                            <option value="South Eastern University of Sri Lanka">South Eastern University of Sri Lanka</option>
                            <option value="Rajarata University of Sri Lanka">Rajarata University of Sri Lanka</option>
                            <option value="Sabaragamuwa University of Sri Lanka">Sabaragamuwa University of Sri Lanka</option>
                            <option value="Wayamba University of Sri Lanka">Wayamba University of Sri Lanka</option>
                            <option value="Uva Wellassa University">Uva Wellassa University</option>
                            <option value="University of the Visual & Performing Arts">University of the Visual & Performing Arts</option>
                            <option value="Gampaha Wickramarachchi University of Indigenous Medicine">Gampaha Wickramarachchi University of Indigenous Medicine</option>
                            <option value="Institute of Technology University of Moratuwa">Institute of Technology University of Moratuwa</option>
                            <option value="University of Vauniya, Sri Lanka">University of Vauniya, Sri Lanka</option>
                            <option value="University of Vocational Technology">University of Vocational Technology</option>
                            <option value="Buddhist and Pali University">Buddhist and Pali University</option>
                            <option value="Ocean University of Sri Lanka">Ocean University of Sri Lanka</option>
                            <option value="Buddhasravaka Bhiksu University">Buddhasravaka Bhiksu University</option>
                            <option value="Sri Lanka Institute of Information Technology (SLIIT)">Sri Lanka Institute of Information Technology (SLIIT)</option>
                            <option value="General Sir John Kotelawala Defence University">General Sir John Kotelawala Defence University</option>
                            <option value="Sri Lanka Technological Campus">Sri Lanka Technological Campus</option>
                            <option value="NSBM Green University">NSBM Green University</option>
                            <option value="Informatics Institute of Technology Sri Lanka">Informatics Institute of Technology Sri Lanka</option>
                            <option value="SLINTEC Academy">SLINTEC Academy</option>
                            <option value="International College of Business and Technology">International College of Business and Technology</option>
                            <option value="National Institute of Business Management (NIBM)">National Institute of Business Management (NIBM)</option>
                            <option value="CINEC Campus">CINEC Campus</option>
                            <option value="Institute of Higher National Diploma in Engineering (HNDE)">Institute of Higher National Diploma in Engineering (HNDE)</option>
                            <option value="Java Institute For Advanced Technology">Java Institute For Advanced Technology</option>
                            <option value="Other universities">Other universities</option>
                        </select>
                        <input
                            type="email"
                            placeholder="University Email"
                            className="form-input"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="form-input"
                            required
                        />

                        <button type="submit" className="signin-button" onClick={onNavigateToHomePage}>
                            Sign In
                        </button>

                    </form>
                    <div className="signup-link">
                        Don’t have an account ? <a onClick={onNavigateToSignUpPage}>Sign Up</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signin;
