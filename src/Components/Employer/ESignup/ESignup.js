import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { X, Loader2 } from "lucide-react";
import SubmitNotiBox from "../../SubmitNotiBox/SubmitNotiBox";

const EmployerSignUp = () => {
    const navigate = useNavigate();
    const [showVerificationPopup, setShowVerificationPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({
        message: "",
        status: "",
        show: false
    });

    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "EMPLOYER",
        companyName: "",
        companyDetails: "",
        location: "",
        categories: [],
        contactNumbers: [],
    });

    const jobCategoriesList = [
        "CASHIER",
        "SALESMEN",
        "RETAIL",
        "TUTORING",
        "CATERING",
        "EVENT_BASED",
        "FOOD_AND_BEVERAGE",
        "DELIVERY",
        "MASCOT_DANCER",
        "SUPERVISOR",
        "KITCHEN_HELPER",
        "STORE_HELPER",
        "ANNOUNCER",
        "LEAFLET_DISTRIBUTOR",
        "TYPING",
        "DATA_ENTRY",
        "WEB_DEVELOPER",
        "OTHER",
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            if (name === "contactNumbers") {
                return {
                    ...prev,
                    contactNumbers: value.split(",").map((num) => num.trim()),
                };
            } else {
                return {
                    ...prev,
                    [name]: value,
                };
            }
        });
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            categories: checked
                ? [...(prevData.categories || []), value]
                : (prevData.categories || []).filter((cat) => cat !== value),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);

        // Always reset notification first
        setNotification({
            message: "",
            status: "",
            show: false
        });

        // Add a small delay to ensure state update before showing new notification
        setTimeout(() => {
            // Client-side validations
            if (formData.password !== formData.confirmPassword) {
                setNotification({
                    message: "Passwords do not match!",
                    status: "error",
                    show: true
                });
                return;
            }

            if (formData.categories.length === 0) {
                setNotification({
                    message: "Please select at least one job category",
                    status: "error",
                    show: true
                });
                return;
            }

            const submitForm = async () => {
                try {
                    setIsLoading(true);
                    console.log("Sending request to register employer...");
                    const response = await axios.post(
                        "http://localhost:8100/api/user/register",
                        formData,
                        { headers: { "Content-Type": "application/json" } }
                    );
                    console.log("API Response:", response);

                    if (response.status === 201) {
                        console.log(response.data);
                        setNotification({
                            message: "Registration successful! Please check your email for verification.",
                            status: "success",
                            show: true
                        });
                        setShowVerificationPopup(true);
                    }
                } catch (error) {
                    console.error("Registration error:", error);
                    
                    // Detailed error handling
                    const errorMessage = error.response?.data?.message || 
                                        error.response?.data?.error || 
                                        error.message || 
                                        "Registration failed. Please try again.";
                    
                    setNotification({
                        message: errorMessage,
                        status: "error",
                        show: true
                    });
                } finally {
                    setIsLoading(false);
                }
            };

            submitForm();
        }, 10); // Small delay to ensure state updates properly
    };

    const handleNextButton = () => {
        setShowVerificationPopup(false);
        navigate("/sign-in");
    };

    const handleChangeRole = () => {
        navigate("/");
    };

    return (
        <div
            className="relative w-full min-h-screen bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: "url('./Background.png')" }}
        >
            {/* Show notification if active */}
            {notification.show && (
                <SubmitNotiBox 
                    message={notification.message} 
                    status={notification.status} 
                    duration={5000} 
                />
            )}
            
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>

            {/* Header */}
            <header className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 text-white">
                <h1 className="text-xl sm:text-4xl font-bold">SIGN UP TO YOUR</h1>
                <p className="text-xl sm:text-4xl font-bold text-blue-500">ADVENTURE!</p>
            </header>

            {/* Change Role Button */}
            <button
                onClick={handleChangeRole}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-blue-500 text-white py-2 px-4 rounded-lg font-bold hover:opacity-90 z-20"
            >
                Change Role
            </button>

            {/* Signup Form Container */}
            <div className="relative z-20 w-full max-w-5xl mx-4 sm:mx-6 lg:mx-8 pt-24 sm:pt-32 pb-8">
                <div className="rounded-lg p-6 sm:p-8">
                    <h2 className="text-white text-2xl sm:text-3xl font-bold mb-6 text-center">SIGN UP</h2>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
                        {/* Company Name */}
                        <div>
                            <input
                                type="text"
                                placeholder="Company/Employer Name"
                                className="w-full px-4 py-3 rounded-lg bg-[#261046] text-[#A4A4A4] text-base placeholder-[#A4A4A4] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="companyName"
                                required
                                onChange={handleInputChange}
                                value={formData.companyName}
                            />
                        </div>
                        {/* Company Details */}
                        <div>
                            <input
                                type="text"
                                placeholder="Description"
                                className="w-full px-4 py-3 rounded-lg bg-[#261046] text-[#A4A4A4] text-base placeholder-[#A4A4A4] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="companyDetails"
                                required
                                onChange={handleInputChange}
                                value={formData.companyDetails}
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <select
                                className="w-full px-4 py-3 rounded-lg bg-[#261046] text-[#A4A4A4] text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="location"
                                required
                                onChange={handleInputChange}
                                value={formData.location}
                            >
                                <option value="">Choose Your Location</option>
                                <option value="AMPARA">AMPARA</option>
                                <option value="ANURADHAPURA">ANURADHAPURA</option>
                                <option value="BADULLA">BADULLA</option>
                                <option value="BATTICALOA">BATTICALOA</option>
                                <option value="COLOMBO">COLOMBO</option>
                                <option value="GALLE">GALLE</option>
                                <option value="GAMPAHA">GAMPAHA</option>
                                <option value="HAMBANTOTA">HAMBANTOTA</option>
                                <option value="JAFFNA">JAFFNA</option>
                                <option value="KALUTARA">KALUTARA</option>
                                <option value="KANDY">KANDY</option>
                                <option value="KEGALLE">KEGALLE</option>
                                <option value="KILINOCHCHI">KILINOCHCHI</option>
                                <option value="KURUNEGALA">KURUNEGALA</option>
                                <option value="MANNAR">MANNAR</option>
                                <option value="MATARA">MATARA</option>
                                <option value="MATALE">MATALE</option>
                                <option value="MONERAGALA">MONERAGALA</option>
                                <option value="MULLAITIVU">MULLAITIVU</option>
                                <option value="NUWARA_ELIYA">NUWARA ELIYA</option>
                                <option value="POLONNARUWA">POLONNARUWA</option>
                                <option value="PUTTALAM">PUTTALAM</option>
                                <option value="RATNAPURA">RATNAPURA</option>
                                <option value="TRINCOMALEE">TRINCOMALEE</option>
                                <option value="VAUNIYA">VAUNIYA</option>
                            </select>
                        </div>

                        {/* Email */}
                        <div>
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full px-4 py-3 rounded-lg bg-[#261046] text-[#A4A4A4] text-base placeholder-[#A4A4A4] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="email"
                                required
                                onChange={handleInputChange}
                                value={formData.email}
                            />
                        </div>

                        {/* Contact Number */}
                        <div>
                            <input
                                type="text"
                                placeholder="Mobile No"
                                className="w-full px-4 py-3 rounded-lg bg-[#261046] text-[#A4A4A4] text-base placeholder-[#A4A4A4] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="contactNumbers"
                                required
                                onChange={handleInputChange}
                                value={formData.contactNumbers}
                            />
                        </div>

                        {/* Username */}
                        <div>
                            <input
                                type="text"
                                placeholder="User Name"
                                className="w-full px-4 py-3 rounded-lg bg-[#261046] text-[#A4A4A4] text-base placeholder-[#A4A4A4] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="userName"
                                required
                                onChange={handleInputChange}
                                value={formData.userName}
                            />
                        </div>

                        {/* Job Categories (Checkboxes) */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="text-white font-bold mb-2 block">Select Job Categories In Your Company:</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-4 py-3 rounded-lg bg-[#261046] text-white">
                                {jobCategoriesList.map((category) => (
                                    <label key={category} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            name="categories"
                                            value={category}
                                            checked={formData.categories.includes(category)}
                                            onChange={handleCheckboxChange}
                                            className="form-checkbox bg-gray-700 border-gray-600 h-4 w-4"
                                        />
                                        <span className="text-white text-sm sm:text-base">{category.replace(/_/g, " ")}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full px-4 py-3 rounded-lg bg-[#261046] text-[#A4A4A4] text-base placeholder-[#A4A4A4] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="password"
                                required
                                onChange={handleInputChange}
                                value={formData.password}
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                className="w-full px-4 py-3 rounded-lg bg-[#261046] text-[#A4A4A4] text-base placeholder-[#A4A4A4] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="confirmPassword"
                                required
                                onChange={handleInputChange}
                                value={formData.confirmPassword}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="col-span-1 md:col-span-2 mt-6 text-center">
                            <button 
                                type="submit" 
                                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-6 rounded-lg font-bold hover:opacity-90 w-full sm:w-auto disabled:opacity-70"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <Loader2 className="animate-spin mr-2 h-5 w-5" />
                                        Processing...
                                    </span>
                                ) : (
                                    "Submit"
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Sign In Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-200">
                            Already have an account?{" "}
                            <span className="text-red-400 font-bold cursor-pointer" onClick={() => navigate("/sign-in")}>
                                Sign In
                            </span>
                        </p>
                    </div>
                </div>

                {/* Email Verification Popup */}
                {showVerificationPopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 shadow-lg w-11/12 sm:w-auto max-w-md text-center relative">
                            <button
                                className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
                                onClick={() => setShowVerificationPopup(false)}
                            >
                                <X size={20} />
                            </button>
                            <h2 className="text-lg font-bold mb-4">Verification</h2>
                            <p className="text-gray-600 mb-4">Check your email for the verification email.</p>
                            <button
                                className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition"
                                onClick={handleNextButton}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployerSignUp;