import React, { useState, useRef } from 'react';
import { ChevronDown, Star, Edit2, Camera, Save } from 'lucide-react';
import {ChatBubbleOvalLeftEllipsisIcon} from "@heroicons/react/24/solid";

function App() {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: 'Aathif Mohamed',
        university: 'University of Ruhuna',
        email: 'aathifmohamed2000@gmail.com',
        gender: 'Male',
        mobileNo: '0779981298',
        address: 'No 53/B Akurana, Kandy',
        emergencyMobileNo: '0779981298',
        password: '',
        confirmPassword: '',
        profilePicture: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80',
    });
    const [passwordError, setPasswordError] = useState('');
    const fileInputRef = useRef(null);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (field === 'password' || field === 'confirmPassword') {
            validatePasswords(field === 'password' ? value : formData.password, field === 'confirmPassword' ? value : formData.confirmPassword);
        }
    };

    const validatePasswords = (pass, confirm) => {
        if (pass || confirm) {
            if (pass !== confirm) {
                setPasswordError('Passwords do not match');
            } else {
                setPasswordError('');
            }
        } else {
            setPasswordError('');
        }
    };

    const handleSave = () => {
        if (passwordError) {
            return;
        }
        // Here you would typically send the data to your backend
        setIsEditing(false);
        // Reset password fields after save
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        setPasswordError('');
    };

    const handleProfilePictureClick = () => {
        if (isEditing) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profilePicture: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div
                className="relative h-[70vh] bg-cover bg-center"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80")',
                }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-50">
                    <div className="max-w-7xl mx-auto h-full flex flex-col justify-center px-6">
                        <h1 className="text-7xl font-bold text-white">
                            Welcome,
                            <br />
                            <span className="text-[#6B7AFF]">Mohamed</span>
                        </h1>
                    </div>
                </div>
            </div>

            {/* Profile Section */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="bg-white rounded-3xl shadow-lg p-8 mb-12">
                    {/* Profile Header */}
                    <div className="flex items-center space-x-6 mb-8">
                        <div className="relative">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                            <img
                                src={formData.profilePicture}
                                alt="Profile"
                                className={`w-32 h-32 rounded-full object-cover ${isEditing ? 'cursor-pointer' : ''}`}
                                onClick={handleProfilePictureClick}
                            />
                            {isEditing && (
                                <div
                                    className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer"
                                    onClick={handleProfilePictureClick}
                                >
                                    <Camera size={24} className="text-white" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold">{formData.fullName}</h2>
                            <p className="text-gray-600">{formData.email}</p>
                        </div>
                        <div className="flex space-x-3">
                            {isEditing && (
                                <button
                                    onClick={handleSave}
                                    disabled={!!passwordError}
                                    className={`px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                                        passwordError ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'
                                    }`}
                                >
                                    <Save size={18} />
                                    <span>Save</span>
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    if (isEditing) {
                                        // Reset form data when canceling edit
                                        setFormData(prev => ({
                                            ...prev,
                                            password: '',
                                            confirmPassword: ''
                                        }));
                                        setPasswordError('');
                                    }
                                    setIsEditing(!isEditing);
                                }}
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg flex items-center space-x-2 hover:bg-blue-600 transition-colors"
                            >
                                <Edit2 size={18} />
                                <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                            <textarea
                                className="w-full p-3 border rounded-lg bg-gray-50"
                                rows={4}
                                disabled={!isEditing}
                                placeholder="Write something about yourself..."
                            />
                        </div>

                        <ProfileField
                            label="Full Name"
                            value={formData.fullName}
                            disabled={!isEditing}
                            onChange={(value) => handleInputChange('fullName', value)}
                        />
                        <ProfileField
                            label="University"
                            value={formData.university}
                            disabled={true}
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                            <div className="relative">
                                <select
                                    value={formData.gender}
                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full p-3 border rounded-lg bg-gray-50 appearance-none"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <ProfileField
                            label="Mobile No"
                            value={formData.mobileNo}
                            disabled={!isEditing}
                            onChange={(value) => handleInputChange('mobileNo', value)}
                        />
                        <ProfileField
                            label="Address"
                            value={formData.address}
                            disabled={!isEditing}
                            onChange={(value) => handleInputChange('address', value)}
                        />
                        <ProfileField
                            label="Emergency Mobile No"
                            value={formData.emergencyMobileNo}
                            disabled={!isEditing}
                            onChange={(value) => handleInputChange('emergencyMobileNo', value)}
                        />
                        <ProfileField
                            label="Password"
                            value={formData.password}
                            type="password"
                            disabled={!isEditing}
                            onChange={(value) => handleInputChange('password', value)}
                        />
                        <div>
                            <ProfileField
                                label="Confirm Password"
                                value={formData.confirmPassword}
                                type="password"
                                disabled={!isEditing}
                                onChange={(value) => handleInputChange('confirmPassword', value)}
                            />
                            {passwordError && (
                                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Company Feedback Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-6">Company Feedback</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <FeedbackCard
                            image="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                            name="Floyd Miles"
                            rating={4}
                            review="Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet."
                        />
                        <FeedbackCard
                            image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
                            name="Ronald Richards"
                            rating={4}
                            review="ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet."
                        />
                        <FeedbackCard
                            image="https://images.unsplash.com/photo-1639149888905-fb39731f2e6c"
                            name="Savannah Nguyen"
                            rating={3}
                            review="Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit."
                        />
                    </div>
                    <div className="flex justify-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    </div>
                </div>
            </div>


        </div>
    );
}

function NavLink({ icon, text, active = false, className = '' }) {
    return (
        <a
            href="#"
            className={`flex items-center space-x-1 ${
                active ? 'text-white' : 'text-gray-400'
            } hover:text-white transition-colors ${className}`}
        >
            {icon}
            <span>{text}</span>
        </a>
    );
}

function ProfileField({ label, value, type = 'text', disabled = true, onChange = null, icon = null }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="relative">
                <input
                    type={type}
                    value={value}
                    onChange={onChange ? (e) => onChange(e.target.value) : undefined}
                    disabled={disabled}
                    className="w-full p-3 border rounded-lg bg-gray-50"
                />
                {icon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}

function FeedbackCard({ image, name, rating, review }) {
    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-4 mb-4">
                <img src={image} alt={name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                    <h3 className="font-semibold">{name}</h3>
                    <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={16}
                                className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <p className="text-gray-600 text-sm">{review}</p>
        </div>
    );
}

export default App;