import React, { useState } from "react";
import "./signin.css";
import {useNavigate} from "react-router-dom";
import {GraduationCap} from "lucide-react";
import axios from "axios";

const baseUrl = window._env_.BASE_URL;
const ESignin = () => {

    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        userName: "",
        password: "",
    });
    const onNavigateToEHomePage = () => {
        navigate("/e-home");
    }
    const onNavigateToESignUpPage = () => {
        navigate("/e-sign-up")
    }
    const verification = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                `${baseUrl}/api/user/login`,
                formData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            localStorage.setItem('token', response.data.data);


            if (response.status === 200) {
                alert("Login Successful!");
                onNavigateToEHomePage(); // Redirect to Home Page after success
            }
        } catch (error) {
            alert(error.response?.data?.message || "Login failed. Please try again.");
            console.log(error.response?.data);
            //window.location.reload();
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

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
                    <p>Sign in with company user name </p>
                    <form onSubmit={verification}>
                        <input
                            type="text"
                            placeholder="User Name"
                            className="form-input"
                            name="userName"
                            required
                            onChange={handleInputChange}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="form-input"
                            name="password"
                            required
                            onChange={handleInputChange}
                        />

                        <button type="submit" className="signin-button">
                            Sign In
                        </button>

                    </form>
                    <div className="signup-link">
                        Don’t have an account ? <span className="text-red-400 font-bold cursor-pointer"  onClick={() => navigate("/e-sign-up")}>Sign Up</span><br/>

                        <span className="text-blue-500 cursor-pointer" >Forgot Password</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ESignin;
