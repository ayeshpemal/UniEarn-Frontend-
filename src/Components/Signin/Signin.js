import React, { useState } from "react";
import "./signin.css";
import {useNavigate} from "react-router-dom";
import {GraduationCap} from "lucide-react";
import axios from "axios";

const Signin = () => {

    const navigate = useNavigate();
    const [formData, setFormData] = useState({
            userName: "",
            password: "",        
        });
    const onNavigateToHomePage = () => {
      navigate("/home");
    }
    const onNavigateToSignUpPage = () => {
      navigate("/sign-up")
    }
    const verification = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                "http://localhost:8100/api/user/login",
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
                onNavigateToHomePage(); // Redirect to Home Page after success
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
                    <p>Sign in with your university email address </p>
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
                        Don’t have an account ? <a onClick={onNavigateToSignUpPage}>Sign Up</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signin;
