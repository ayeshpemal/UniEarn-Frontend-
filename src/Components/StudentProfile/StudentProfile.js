import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Star, Edit2, Camera, Save, Lock } from 'lucide-react';
import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/24/solid";
import { jwtDecode } from 'jwt-decode';

// Define preference options
const PREFERENCE_OPTIONS = [
    'CASHIER', 'SALESMEN', 'RETAIL', 'TUTORING', 'CATERING', 'EVENT_BASED',
    'FOOD_AND_BEVERAGE', 'DELIVERY', 'MASCOT_DANCER', 'SUPERVISOR', 'KITCHEN_HELPER',
    'STORE_HELPER', 'ANNOUNCER', 'LEAFLET_DISTRIBUTOR', 'TYPING', 'DATA_ENTRY',
    'WEB_DEVELOPER', 'OTHER'
];

// Define address options
const ADDRESS_OPTIONS = [
    'AMPARA', 'ANURADHAPURA', 'BADULLA', 'BATTICALOA', 'COLOMBO', 'GALLE',
    'GAMPAHA', 'HAMBANTOTA', 'JAFFNA', 'KALUTARA', 'KANDY', 'KEGALLE',
    'KILINOCHCHI', 'KURUNEGALA', 'MANNAR', 'MATARA', 'MATALE', 'MONERAGALA',
    'MULLAITIVU', 'NUWARA_ELIYA', 'POLONNARUWA', 'PUTTALAM', 'RATNAPURA',
    'TRINCOMALEE', 'VAUNIYA'
];

function App() {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        userName: '',
        displayName: '',
        university: '',
        email: '',
        gender: '',
        mobileNo: '',
        address: '',
        preferences: [],
        profilePicture: '',
        rating: 0,
    });
    const [originalFormData, setOriginalFormData] = useState(null);
    const [selectedProfilePictureFile, setSelectedProfilePictureFile] = useState(null);
    const fileInputRef = useRef(null);

    // Password update state
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [passwordUpdateData, setPasswordUpdateData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [passwordUpdateError, setPasswordUpdateError] = useState('');

    // Fetch user data and profile picture on mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token found');
                
                const decodedToken = jwtDecode(token);
                const userId = decodedToken.user_id;

                const userResponse = await fetch(`http://localhost:8100/api/user/get-user-by-id/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!userResponse.ok) throw new Error('Failed to fetch user data');

                const userResult = await userResponse.json();
                const userData = userResult.data;

                const profilePictureResponse = await fetch(`http://localhost:8100/api/user/${userId}/profile-picture`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                let profilePictureUrl = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80';
                if (profilePictureResponse.ok) {
                    const profilePictureResult = await profilePictureResponse.json();
                    if (profilePictureResult.code === 200 && profilePictureResult.data) {
                        profilePictureUrl = profilePictureResult.data;
                    }
                } else {
                    console.warn('Failed to fetch profile picture:', (await profilePictureResponse.json()).message);
                }

                const fetchedData = {
                    userName: userData.userName || '',
                    displayName: userData.displayName || '',
                    university: userData.university || '',
                    email: userData.email || '',
                    gender: userData.gender ? userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1).toLowerCase() : '',
                    mobileNo: userData.contactNumbers?.[0] || '',
                    address: userData.location || '',
                    preferences: userData.preferences || [],
                    profilePicture: profilePictureUrl,
                    rating: userData.rating || 0,
                };

                setFormData(fetchedData);
                setOriginalFormData(fetchedData);
            } catch (error) {
                console.error('Error fetching user data or profile picture:', error);
            }
        };
        fetchUserData();
    }, []);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePasswordUpdateChange = (field, value) => {
        setPasswordUpdateData(prev => {
            const updated = { ...prev, [field]: value };
            validatePasswordUpdate(updated.oldPassword, updated.newPassword, updated.confirmNewPassword);
            return updated;
        });
    };

    const validatePasswordUpdate = (oldPass, newPass, confirmPass) => {
        if (!newPass || !confirmPass) {
            setPasswordUpdateError('');
            return;
        }

        if (newPass === oldPass) {
            setPasswordUpdateError('New password cannot be the same as the current password');
        } else if (newPass !== confirmPass) {
            setPasswordUpdateError('New password and confirm password do not match');
        } else if (newPass.length < 6) {
            setPasswordUpdateError('Password must be at least 6 characters long');
        } else {
            setPasswordUpdateError('');
        }
    };

    const togglePreference = (preference) => {
        setFormData(prev => ({
            ...prev,
            preferences: prev.preferences.includes(preference)
                ? prev.preferences.filter(p => p !== preference)
                : [...prev.preferences, preference]
        }));
    };

    const handleProfilePictureClick = () => {
        if (isEditing) fileInputRef.current?.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profilePicture: reader.result }));
            };
            reader.readAsDataURL(file);
            setSelectedProfilePictureFile(file);
        }
    };

    const hasUserDataChanges = () => {
        const sortedPreferences = [...formData.preferences].sort();
        const sortedOriginalPreferences = [...originalFormData.preferences].sort();
        return (
            formData.displayName !== originalFormData.displayName ||
            formData.mobileNo !== originalFormData.mobileNo ||
            formData.address !== originalFormData.address ||
            JSON.stringify(sortedPreferences) !== JSON.stringify(sortedOriginalPreferences)
        );
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.user_id;

            if (hasUserDataChanges()) {
                const updateData = {
                    displayName: formData.displayName,
                    location: formData.address,
                    contactNumber: [formData.mobileNo],
                    gender: formData.gender.toUpperCase(),
                    preferences: formData.preferences,
                    skills: [],
                    companyName: null,
                    companyDetails: null,
                };

                const response = await fetch(`http://localhost:8100/api/user/update/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateData),
                });

                if (!response.ok) throw new Error('Failed to update user data');
            }

            if (selectedProfilePictureFile) {
                const formDataForUpload = new FormData();
                formDataForUpload.append('file', selectedProfilePictureFile);

                const response = await fetch(`http://localhost:8100/api/user/${userId}/profile-picture`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formDataForUpload,
                });

                if (!response.ok) throw new Error('Failed to update profile picture');
                const result = await response.json();
                const newProfilePictureUrl = result.data || formData.profilePicture;
                setFormData(prev => ({ ...prev, profilePicture: newProfilePictureUrl }));
                setSelectedProfilePictureFile(null);
            }

            setOriginalFormData({
                ...originalFormData,
                displayName: formData.displayName,
                mobileNo: formData.mobileNo,
                address: formData.address,
                preferences: [...formData.preferences],
                profilePicture: formData.profilePicture,
            });
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving data:', error);
        }
    };

    const handleUpdatePassword = async () => {
        if (passwordUpdateError) return;

        try {
            const token = localStorage.getItem('token');
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.user_id;

            const updateData = {
                oldPassword: passwordUpdateData.oldPassword,
                newPassword: passwordUpdateData.newPassword,
            };

            const response = await fetch(`http://localhost:8100/api/user/update-password/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update password');
            }

            setPasswordUpdateData({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
            setPasswordUpdateError('');
            setIsUpdatingPassword(false);
            alert('Password updated successfully!');
        } catch (error) {
            setPasswordUpdateError(error.message || 'An error occurred while updating the password');
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div
                className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] bg-cover bg-center"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80")',
                }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-50">
                    <div className="container mx-auto h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white">
                            Welcome
                            <br />
                            <span className="text-[#6B7AFF]">{formData.displayName}</span>
                        </h1>
                    </div>
                </div>
            </div>

            {/* Profile Section */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
                <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 mb-6 sm:mb-12">
                    {/* Profile Header */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
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
                                className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover ${isEditing ? 'cursor-pointer' : ''}`}
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
                        <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-xl sm:text-2xl font-bold">{formData.displayName}</h2>
                            <p className="text-gray-600 text-sm sm:text-base">{formData.email}</p>
                            <div className="flex justify-center sm:justify-start items-center space-x-1 mt-2 md:float-right">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        className={i < formData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                                    />
                                ))}
                                <span className="text-gray-600 ml-2 text-sm">{formData.rating}/5</span>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            {isEditing && (
                                <button
                                    onClick={handleSave}
                                    disabled={!hasUserDataChanges()}
                                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm sm:text-base ${
                                        !hasUserDataChanges() ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'
                                    }`}
                                >
                                    <Save size={18} />
                                    <span>Save</span>
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    if (isEditing) {
                                        setFormData(originalFormData);
                                        setSelectedProfilePictureFile(null);
                                    }
                                    setIsEditing(!isEditing);
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center space-x-2 hover:bg-blue-600 transition-colors text-sm sm:text-base"
                            >
                                <Edit2 size={18} />
                                <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <ProfileField
                            label="User name"
                            value={formData.userName}
                            disabled={true}
                        />
                        <ProfileField
                            label="Display Name"
                            value={formData.displayName}
                            disabled={!isEditing}
                            onChange={(value) => handleInputChange('displayName', value)}
                        />
                        <ProfileField
                            label="University"
                            value={formData.university}
                            disabled={true}
                        />
                        <ProfileField
                            label="Gender"
                            value={formData.gender}
                            disabled={true}
                        />
                        <ProfileField
                            label="Mobile No"
                            value={formData.mobileNo}
                            disabled={!isEditing}
                            onChange={(value) => handleInputChange('mobileNo', value)}
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                            {isEditing ? (
                                <select
                                    value={formData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    className="w-full p-2 sm:p-3 border rounded-lg bg-gray-50 text-sm sm:text-base"
                                >
                                    <option value="">Select an address</option>
                                    {ADDRESS_OPTIONS.map(address => (
                                        <option key={address} value={address}>
                                            {address}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={formData.address}
                                    disabled={true}
                                    className="w-full p-2 sm:p-3 border rounded-lg bg-gray-50 text-sm sm:text-base"
                                />
                            )}
                        </div>
                        <div className="col-span-1 sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Preferences</label>
                            {isEditing ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg bg-gray-50">
                                    {PREFERENCE_OPTIONS.map(preference => (
                                        <div key={preference} className="flex items-center space-x-1">
                                            <input
                                                type="checkbox"
                                                id={preference}
                                                checked={formData.preferences.includes(preference)}
                                                onChange={() => togglePreference(preference)}
                                            />
                                            <label htmlFor={preference} className="text-sm">{preference}</label>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="w-full p-3 border rounded-lg bg-gray-50 text-sm">
                                    {formData.preferences.length > 0 ? formData.preferences.join(', ') : 'None selected'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Update Password Section */}
                <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 mb-6 sm:mb-12">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center space-x-2">
                        <Lock size={24} />
                        <span>Update Password</span>
                    </h2>
                    <button
                        onClick={() => setIsUpdatingPassword(!isUpdatingPassword)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center space-x-2 hover:bg-blue-600 transition-colors text-sm sm:text-base mb-4"
                    >
                        <ChevronDown size={18} className={isUpdatingPassword ? 'rotate-180' : ''} />
                        <span>{isUpdatingPassword ? 'Hide' : 'Update Password'}</span>
                    </button>
                    {isUpdatingPassword && (
                        <div className="grid grid-cols-1 gap-4 sm:gap-6">
                            <div>
                                <ProfileField
                                    label="Current Password"
                                    value={passwordUpdateData.oldPassword}
                                    type="password"
                                    onChange={(value) => handlePasswordUpdateChange('oldPassword', value)}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <ProfileField
                                    label="New Password"
                                    value={passwordUpdateData.newPassword}
                                    type="password"
                                    onChange={(value) => handlePasswordUpdateChange('newPassword', value)}
                                />
                                <ProfileField
                                    label="Confirm New Password"
                                    value={passwordUpdateData.confirmNewPassword}
                                    type="password"
                                    onChange={(value) => handlePasswordUpdateChange('confirmNewPassword', value)}
                                />
                            </div>
                            {passwordUpdateError && (
                                <p className="text-red-500 text-sm mt-1 col-span-1 sm:col-span-2">{passwordUpdateError}</p>
                            )}
                            <div className="col-span-1 sm:col-span-2">
                                <button
                                    onClick={handleUpdatePassword}
                                    disabled={!!passwordUpdateError || !passwordUpdateData.newPassword || !passwordUpdateData.confirmNewPassword || !passwordUpdateData.oldPassword}
                                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm sm:text-base ${
                                        passwordUpdateError || !passwordUpdateData.newPassword || !passwordUpdateData.confirmNewPassword || !passwordUpdateData.oldPassword
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-green-500 hover:bg-green-600 text-white'
                                    }`}
                                >
                                    <Save size={18} />
                                    <span>Update Password</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Company Feedback Section */}
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Company Feedback</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        <FeedbackCard
                            image="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                            name="Floyd Miles"
                            rating={4}
                            review="Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint."
                        />
                        <FeedbackCard
                            image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
                            name="Ronald Richards"
                            rating={4}
                            review="ullamco est sit aliqua dolor do amet sint."
                        />
                        <FeedbackCard
                            image="https://images.unsplash.com/photo-1639149888905-fb39731f2e6c"
                            name="Savannah Nguyen"
                            rating={3}
                            review="Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint."
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

function ProfileField({ label, value, type = 'text', onChange = null }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <input
                type={type}
                value={value}
                onChange={onChange ? (e) => onChange(e.target.value) : undefined}
                className="w-full p-2 sm:p-3 border rounded-lg bg-gray-50 text-sm sm:text-base"
            />
        </div>
    );
}

function FeedbackCard({ image, name, rating, review }) {
    return (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center space-x-4 mb-4">
                <img src={image} alt={name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover" />
                <div>
                    <h3 className="font-semibold text-sm sm:text-base">{name}</h3>
                    <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={14}
                                className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm">{review}</p>
        </div>
    );
}

export default App;