import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Edit2, Camera, Save, Lock } from 'lucide-react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import SubmitNotiBox from '../../SubmitNotiBox/SubmitNotiBox'; // Add this import

const baseUrl = window._env_.BASE_URL;
function App() {
    const [isEditing, setIsEditing] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [viewUserId, setViewUserId] = useState(null);
    const [formData, setFormData] = useState({
        userName: '',
        displayName: '',
        email: '',
        profilePicture: '',
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

    // Add notification state
    const [notification, setNotification] = useState({
        message: '',
        status: '',
        show: false
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlUserId = params.get('userId');
        
        if (urlUserId) {
            setIsViewMode(true);
            setViewUserId(urlUserId);
        }
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token found');
                
                const decodedToken = jwtDecode(token);
                const userId = isViewMode ? viewUserId : decodedToken.user_id;

                const userResponse = await axios.get(
                    `${baseUrl}/api/user/get-user-by-id/${userId}`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                
                const userData = userResponse.data.data;

                let profilePictureUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.userName)}&background=random`;
                try {
                    const profilePictureResponse = await axios.get(
                        `${baseUrl}/api/user/${userId}/profile-picture`,
                        { headers: { 'Authorization': `Bearer ${token}` } }
                    );
                    
                    if (profilePictureResponse.data.code === 200 && profilePictureResponse.data.data) {
                        profilePictureUrl = profilePictureResponse.data.data;
                    }
                } catch (error) {
                    console.warn('Failed to fetch profile picture:', error.response?.data?.message || error.message);
                }

                const fetchedData = {
                    userName: userData.userName || '',
                    displayName: userData.displayName || '',
                    email: userData.email || '',
                    profilePicture: profilePictureUrl,
                };

                setFormData(fetchedData);
                setOriginalFormData(fetchedData);
            } catch (error) {
                console.error('Error fetching user data or profile picture:', error);
            }
        };
        
        if (viewUserId || localStorage.getItem('token')) {
            fetchUserData();
        }
    }, [isViewMode, viewUserId]);

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
        if (!originalFormData) return false;
        
        return (
            formData.displayName !== originalFormData.displayName ||
            selectedProfilePictureFile !== null
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
                };

                await axios.put(
                    `${baseUrl}/api/user/update/${userId}`,
                    updateData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        }
                    }
                );
            }

            if (selectedProfilePictureFile) {
                const formDataForUpload = new FormData();
                formDataForUpload.append('file', selectedProfilePictureFile);

                const response = await axios.put(
                    `${baseUrl}/api/user/${userId}/profile-picture`,
                    formDataForUpload,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                const newProfilePictureUrl = response.data.data || formData.profilePicture;
                setFormData(prev => ({ ...prev, profilePicture: newProfilePictureUrl }));
                setSelectedProfilePictureFile(null);
            }

            setOriginalFormData({
                ...originalFormData,
                displayName: formData.displayName,
                profilePicture: formData.profilePicture,
            });
            setIsEditing(false);
            
            // Show success notification
            setNotification({
                message: 'Profile updated successfully!',
                status: 'success',
                show: true
            });

            // Hide notification after duration
            setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
            }, 5000);
        } catch (error) {
            console.error('Error saving data:', error);
            
            // Show error notification
            setNotification({
                message: error.response?.data?.message || 'Failed to update profile',
                status: 'error',
                show: true
            });
            
            // Hide notification after duration
            setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
            }, 5000);
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

            await axios.put(
                `${baseUrl}/api/user/update-password/${userId}`,
                updateData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            setPasswordUpdateData({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
            setPasswordUpdateError('');
            setIsUpdatingPassword(false);
            
            // Show success notification instead of alert
            setNotification({
                message: 'Password updated successfully!',
                status: 'success',
                show: true
            });
            
            // Hide notification after duration
            setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
            }, 5000);
        } catch (error) {
            setPasswordUpdateError(error.response?.data?.message || 'An error occurred while updating the password');
            
            // Show error notification
            setNotification({
                message: error.response?.data?.message || 'Failed to update password',
                status: 'error',
                show: true
            });
            
            // Hide notification after duration
            setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
            }, 5000);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Add SubmitNotiBox component */}
            {notification.show && (
                <SubmitNotiBox
                    message={notification.message}
                    status={notification.status}
                    duration={5000}
                />
            )}
            
            {/* Hero Section */}
            <div
                className="relative h-[60vh] bg-cover bg-center"
                style={{
                    backgroundImage:
                        'url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80")',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/40 backdrop-blur-[1px]">
                    <div className="max-w-7xl mx-auto h-full flex flex-col justify-end pb-24 px-4 sm:px-6">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-md mt-20">
                            {isViewMode ? 'Profile' : 'Welcome'}<br />
                            <span className="text-blue-400 drop-shadow-lg">{formData.userName}</span>
                        </h1>
                        <p className="mt-3 text-white/90 text-lg sm:text-xl max-w-2xl drop-shadow-sm">
                            {isViewMode ? 'View user information' : 'Manage your account information'}
                        </p>
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
                            <h2 className="text-xl sm:text-2xl font-bold">{formData.userName}</h2>
                            <p className="text-gray-600 text-sm sm:text-base">{formData.email}</p>
                        </div>
                        {!isViewMode && (
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
                        )}
                    </div>

                    {/* Profile Form */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {/* <ProfileField
                            label="User name"
                            value={formData.userName}
                            disabled={true}
                        />
                        <ProfileField
                            label="Display Name"
                            value={formData.displayName}
                            disabled={!isEditing}
                            onChange={(value) => handleInputChange('displayName', value)}
                        /> */}
                    </div>
                </div>

                {/* Update Password Section */}
                {!isViewMode && (
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
                )}
            </div>
        </div>
    );
}

function ProfileField({ label, value, type = 'text', disabled = false, onChange = null }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <input
                type={type}
                value={value}
                disabled={disabled}
                onChange={onChange ? (e) => onChange(e.target.value) : undefined}
                className="w-full p-2 sm:p-3 border rounded-lg bg-gray-50 text-sm sm:text-base"
            />
        </div>
    );
}

export default App;