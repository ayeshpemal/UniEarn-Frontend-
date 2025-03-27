import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { X } from "lucide-react";

const EmployerSignUp = () => {
    const navigate = useNavigate();
    const [showVerificationPopup, setShowVerificationPopup] = useState(false);

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

    // Handle Input Change
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

    // Handle Checkbox Change
    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            categories: checked
                ? [...(prevData.categories || []), value]
                : (prevData.categories || []).filter((cat) => cat !== value),
        }));
    };

    // Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log(formData);

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            console.log("Sending request to register employer...");
            const response = await axios.post(
                "http://localhost:8100/api/user/register",
                formData,
                {
                    headers: { "Content-Type": "application/json" },
                }
            );
            console.log("API Response:", response);

            if (response.status === 201) {
                console.log(response.data);
                setShowVerificationPopup(true);
            }
        } catch (error) {
            alert(error.response?.data?.message || "Registration failed. Please try again.");
            console.log(error.response?.data);
        }
    };

    const handleNextButton = () => {
        setShowVerificationPopup(false);
        navigate("/sign-in");
    };

    const handleChangeRole = () => {
        navigate("/");
    };

    return (
        <div className="relative w-full h-screen bg-cover bg-center signin-container">
            <header className="absolute top-10 left-10 z-10 text-white">
                <h1 className="text-4xl font-bold">SIGN UP TO YOUR</h1>
                <p className="text-4xl font-bold text-blue-500">ADVENTURE!</p>
            </header>

            {/* Change Role Button */}
            <button
                onClick={handleChangeRole}
                className="absolute top-10 right-10 bg-blue-500 text-white py-2 px-4 rounded-lg font-bold hover:opacity-90 z-50"
            >
                Change Role
            </button>

            <div className="relative z-20 flex flex-col items-center justify-center h-full">
                <div className="bg-opacity-90 rounded-lg p-8 w-11/12 max-w-4xl">
                    <h2 className="text-white text-3xl font-bold mb-6 text-center">SIGN UP</h2>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
                        {/* Company Name */}
                        <div>
                            <input
                                type="text"
                                placeholder="Company/Employer Name"
                                className="form-input w-full px-4 py-3 rounded-lg"
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
                                className="form-input w-full px-4 py-3 rounded-lg"
                                name="companyDetails"
                                required
                                onChange={handleInputChange}
                                value={formData.companyDetails}
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <select
                                className="form-input w-full px-4 py-3 rounded-lg"
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
                                className="form-input w-full px-4 py-3 rounded-lg"
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
                                className="form-input w-full px-4 py-3 rounded-lg"
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
                                className="form-input w-full px-4 py-3 rounded-lg"
                                name="userName"
                                required
                                onChange={handleInputChange}
                                value={formData.userName}
                            />
                        </div>

                        {/* Job Categories (Checkboxes) */}
                        <div className="col-span-2">
                            <label className="text-white font-bold mb-2 block">Select Job Categories In Your Company:</label>
                            <div className="grid grid-cols-3 gap-2 px-4 py-3 rounded-lg bg-[#261046] text-white">
                                {jobCategoriesList.map((category) => (
                                    <label key={category} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            name="categories"
                                            value={category}
                                            checked={formData.categories.includes(category)}
                                            onChange={handleCheckboxChange}
                                            className="form-checkbox bg-gray-700 border-gray-600"
                                        />
                                        <span className="text-white">{category.replace(/_/g, " ")}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                className="form-input w-full px-4 py-3 rounded-lg"
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
                                className="form-input w-full px-4 py-3 rounded-lg"
                                name="confirmPassword"
                                required
                                onChange={handleInputChange}
                                value={formData.confirmPassword}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="col-span-2 mt-6 text-center">
                            <button type="submit" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-6 rounded-lg font-bold hover:opacity-90">
                                Submit
                            </button>
                        </div>
                    </form>
                </div>

                {/* Email Verification Popup */}
                {showVerificationPopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white rounded-2xl p-6 shadow-lg w-auto text-center relative">
                            {/* Close Button */}
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