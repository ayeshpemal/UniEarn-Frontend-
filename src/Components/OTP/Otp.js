import React, { useState } from "react";

const OTPVerification = () => {
    const [otp, setOtp] = useState(Array(6).fill(""));

    const handleChange = (element, index) => {
        const value = element.value.replace(/\D/g, ""); // Allow only digits
        if (value) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // Move to the next input field
            if (element.nextSibling) {
                element.nextSibling.focus();
            }
        }
    };

    const handleBackspace = (element, index) => {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);

        // Move to the previous input field
        if (element.previousSibling) {
            element.previousSibling.focus();
        }
    };

    const handleSubmit = () => {
        const otpValue = otp.join(""); // Join digits
        const formattedOtp = `${otpValue.slice(0, 3)}.${otpValue.slice(3)}`; // Format as 3.3
        console.log("Entered OTP:", formattedOtp); // Log the formatted OTP
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            {/* OTP Container */}
            <div className="bg-purple-900 bg-opacity-90 rounded-xl p-6 max-w-lg w-full text-center relative">
                {/* Close Button */}
                <button
                    className="absolute top-4 right-4 text-white text-xl"
                    onClick={() => console.log("Close Modal")}
                >
                    &times;
                </button>

                {/* Header */}
                <h2 className="text-white text-2xl font-bold mb-2">PIN</h2>
                <p className="text-gray-300 mb-6">
                    Enter 6 digit verification code sent to your phone number
                </p>

                {/* OTP Input Fields */}
                <div className="flex justify-center gap-2 mb-6">
                    {otp.map((value, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength="1"
                            value={value}
                            onChange={(e) => handleChange(e.target, index)}
                            onKeyDown={(e) =>
                                e.key === "Backspace" ? handleBackspace(e.target, index) : null
                            }
                            className="w-12 h-12 text-center text-2xl rounded-lg bg-purple-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    ))}
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-bold w-full hover:opacity-90"
                >
                    Create Account
                </button>

                {/* Resend Code */}
                <p className="mt-4 text-sm text-red-500 cursor-pointer hover:underline">
                    Resend Code
                </p>
            </div>
        </div>
    );
};

export default OTPVerification;
