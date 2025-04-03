import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Star, Edit2, Camera, Save, Lock, Flag } from 'lucide-react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import ReportPopup from '../ReportPopup/ReportPopup';
import SubmitNotiBox from '../SubmitNotiBox/SubmitNotiBox'; // Add this import

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
    const [isViewMode, setIsViewMode] = useState(false);
    const [viewUserId, setViewUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
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

    // Add these new state variables for rating functionality
    const [isRatingMode, setIsRatingMode] = useState(false);
    const [applicationId, setApplicationId] = useState(null);
    const [ratingData, setRatingData] = useState({
        rating: 0,
        comment: '',
    });
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);
    const [ratingError, setRatingError] = useState('');
    const [ratingSuccess, setRatingSuccess] = useState('');

    // Add a ref for the rating section
    const ratingRef = useRef(null);

    // Add these state variables for feedback pagination
    const [feedbacks, setFeedbacks] = useState([]);
    const [feedbackPage, setFeedbackPage] = useState(0);
    const [feedbackPageSize, setFeedbackPageSize] = useState(3);
    const [totalFeedbacks, setTotalFeedbacks] = useState(0);
    const [feedbackLoading, setFeedbackLoading] = useState(true);

    // Add new state for report popup
    const [isReportPopupOpen, setIsReportPopupOpen] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [showReportTooltip, setShowReportTooltip] = useState(false);

    // Add notification state
    const [notification, setNotification] = useState({
        message: '',
        status: '',
        show: false
    });

    // Check view mode and set initial state
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlUserId = params.get('userId');
        const urlApplicationId = params.get('applicationId');
        
        if (urlUserId) {
            setIsViewMode(true);
            setViewUserId(urlUserId);
            
            if (urlApplicationId) {
                setIsRatingMode(true);
                setApplicationId(urlApplicationId);
            }
        } else {
            setIsViewMode(false);
            setViewUserId(null);
        }
        // Only set loading to false after initial state is determined
        setIsLoading(false);
    }, []);

    // Fetch user data only when not loading and view mode is determined
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token found');
                
                let userId;
                if (isViewMode && viewUserId) {
                    userId = viewUserId;
                } else {
                    const decodedToken = jwtDecode(token);
                    userId = decodedToken.user_id;
                }

                const userResponse = await axios.get(
                    `http://localhost:8100/api/user/get-user-by-id/${userId}`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                
                const userData = userResponse.data.data;

                let profilePictureUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.userName)}&background=random`;
                try {
                    const profilePictureResponse = await axios.get(
                        `http://localhost:8100/api/user/${userId}/profile-picture`,
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
            } finally {
                setIsLoading(false);
            }
        };

        if (!isLoading && localStorage.getItem('token')) {
            fetchUserData();
        }
    }, [isLoading, isViewMode, viewUserId]);

    // Add useEffect to scroll to rating section when in rating mode
    useEffect(() => {
        if (isViewMode && isRatingMode && ratingRef.current && !isLoading) {
            setTimeout(() => {
                ratingRef.current.scrollIntoView({ behavior: 'smooth' });
            }, 500); // Small delay to ensure DOM is fully rendered
        } else {
            // For all other cases, scroll to top of page
            window.scrollTo(0, 0);
        }
    }, [isRatingMode, isViewMode, isLoading]);

    // Add a new useEffect to fetch feedback data
    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                setFeedbackLoading(true);
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token found');
                
                let userId;
                if (isViewMode && viewUserId) {
                    userId = viewUserId;
                } else {
                    const decodedToken = jwtDecode(token);
                    userId = decodedToken.user_id;
                }

                const response = await axios.get(
                    `http://localhost:8100/api/v1/rating/received/${userId}?page=${feedbackPage}&size=${feedbackPageSize}`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                
                if (response.data.code === 200) {
                    setFeedbacks(response.data.data.ratingDetails || []);
                    setTotalFeedbacks(response.data.data.ratingCount || 0);
                }
            } catch (error) {
                console.error('Error fetching feedbacks:', error);
                setFeedbacks([]);
            } finally {
                setFeedbackLoading(false);
            }
        };

        if (!isLoading && localStorage.getItem('token')) {
            fetchFeedbacks();
        }
    }, [isLoading, isViewMode, viewUserId, feedbackPage, feedbackPageSize]);

    // Get the current user ID on component mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setCurrentUserId(decodedToken.user_id);
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }
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
        if (isEditing && !isViewMode) fileInputRef.current?.click();
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
        
        const sortedPreferences = [...formData.preferences].sort();
        const sortedOriginalPreferences = [...originalFormData.preferences].sort();
        
        return (
            formData.displayName !== originalFormData.displayName ||
            formData.mobileNo !== originalFormData.mobileNo ||
            formData.address !== originalFormData.address ||
            JSON.stringify(sortedPreferences) !== JSON.stringify(sortedOriginalPreferences) ||
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
                    location: formData.address,
                    contactNumber: [formData.mobileNo],
                    gender: formData.gender.toUpperCase(),
                    preferences: formData.preferences,
                    skills: [],
                    companyName: null,
                    companyDetails: null,
                };

                await axios.put(
                    `http://localhost:8100/api/user/update/${userId}`,
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
                    `http://localhost:8100/api/user/${userId}/profile-picture`,
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
                mobileNo: formData.mobileNo,
                address: formData.address,
                preferences: [...formData.preferences],
                profilePicture: formData.profilePicture,
            });
            setIsEditing(false);
            
            // Show success notification
            setNotification({
                message: 'Profile updated successfully!',
                status: 'success',
                show: true
            });
        } catch (error) {
            console.error('Error saving data:', error);
            
            // Show error notification
            setNotification({
                message: error.response?.data?.message || 'Failed to update profile',
                status: 'error',
                show: true
            });
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
                `http://localhost:8100/api/user/update-password/${userId}`,
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
        } catch (error) {
            setPasswordUpdateError(error.response?.data?.message || 'An error occurred while updating the password');
            
            // Show error notification
            setNotification({
                message: error.response?.data?.message || 'Failed to update password',
                status: 'error',
                show: true
            });
        }
    };

    // Add a new handler for rating star clicks
    const handleRatingClick = (value) => {
        setRatingData(prev => ({ ...prev, rating: value }));
    };

    // Add a new handler for rating comment change
    const handleRatingCommentChange = (value) => {
        setRatingData(prev => ({ ...prev, comment: value }));
    };

    // Add a new function to submit the rating
    const handleSubmitRating = async () => {
        if (ratingData.rating === 0) {
            setRatingError('Please select a rating');
            return;
        }

        try {
            setIsSubmittingRating(true);
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');
            
            const decodedToken = jwtDecode(token);
            const raterId = decodedToken.user_id;

            await axios.post(
                `http://localhost:8100/api/v1/rating/create`,
                {
                    raterId: raterId,
                    ratedId: parseInt(viewUserId),
                    applicationId: parseInt(applicationId),
                    score: ratingData.rating,
                    comment: ratingData.comment
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            setRatingSuccess('Rating submitted successfully!');
            setRatingError('');
            // Refresh user data to show updated rating
            window.location.href = `/profile?userId=${viewUserId}`;
        } catch (error) {
            setRatingError(error.response?.data?.message || 'Failed to submit rating');
        } finally {
            setIsSubmittingRating(false);
        }
    };

    // Add this function to handle page changes
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage <= Math.ceil(totalFeedbacks / feedbackPageSize) - 1) {
            setFeedbackPage(newPage);
        }
    };

    // Function to handle opening the report popup
    const handleOpenReportPopup = () => {
        setIsReportPopupOpen(true);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Add the SubmitNotiBox component */}
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
                    backgroundImage: 'url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80")',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/40 backdrop-blur-[1px]">
                    <div className="max-w-7xl mx-auto h-full flex flex-col justify-end pb-24 px-4 sm:px-6">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-md mt-20">
                            {isViewMode ? 'Profile' : 'Welcome'}
                            <br />
                            <span className="text-blue-400 drop-shadow-lg">{formData.displayName}</span>
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
                                className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover ${isEditing && !isViewMode ? 'cursor-pointer' : ''}`}
                                onClick={isViewMode ? undefined : handleProfilePictureClick}
                            />
                            {isEditing && !isViewMode && (
                                <div
                                    className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer"
                                    onClick={handleProfilePictureClick}
                                >
                                    <Camera size={24} className="text-white" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-between">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold">{formData.displayName}</h2>
                                    <p className="text-gray-600 text-sm sm:text-base">{formData.email}</p>
                                </div>
                                
                                {/* Report Button (Icon only with tooltip) */}
                                {isViewMode && currentUserId && currentUserId !== viewUserId && (
                                    <div className="relative">
                                        <button
                                            onClick={handleOpenReportPopup}
                                            className="p-2 bg-gray-100 hover:bg-gray-200 text-red-500 rounded-full transition-colors"
                                            aria-label="Report User"
                                            onMouseEnter={() => setShowReportTooltip(true)}
                                            onMouseLeave={() => setShowReportTooltip(false)}
                                        >
                                            <Flag size={18} />
                                        </button>
                                        
                                        {showReportTooltip && (
                                            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-3 whitespace-nowrap">
                                                Report User
                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex justify-center sm:justify-start items-center space-x-1 mt-2">
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
                        
                        {/* Add Report Button for View Mode */}
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
                        <ProfileField
                            label="User name"
                            value={formData.userName}
                            disabled={true}
                        />
                        <ProfileField
                            label="Display Name"
                            value={formData.displayName}
                            disabled={!isEditing || isViewMode}
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
                        
                        {/* Show mobile number in both view mode and normal mode */}
                        <ProfileField
                            label="Mobile No"
                            value={formData.mobileNo}
                            disabled={!isEditing || isViewMode}
                            onChange={(value) => handleInputChange('mobileNo', value)}
                        />
                        
                        {/* Only show address and preferences if not in view mode */}
                        {!isViewMode && (
                            <>
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
                            </>
                        )}
                    </div>
                </div>

                {/* Update Password Section - Only show if not in view mode */}
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

                {/* Rating Section - Only show if in rating mode */}
                {isViewMode && isRatingMode && (
                    <div ref={ratingRef} className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 scroll-mt-20">
                        <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 mb-6 sm:mb-12">
                            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center space-x-2">
                                <Star size={24} />
                                <span>Rate this Student</span>
                            </h2>
                            <div className="grid grid-cols-1 gap-4 sm:gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                    <div className="flex items-center space-x-2">
                                        {[1, 2, 3, 4, 5].map((rating) => (
                                            <Star
                                                key={rating}
                                                size={30}
                                                className={`cursor-pointer ${
                                                    rating <= ratingData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                                }`}
                                                onClick={() => handleRatingClick(rating)}
                                            />
                                        ))}
                                        <span className="ml-2 text-gray-600">
                                            {ratingData.rating > 0 ? `${ratingData.rating} out of 5` : 'Select rating'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Feedback (Optional)</label>
                                    <textarea
                                        value={ratingData.comment}
                                        onChange={(e) => handleRatingCommentChange(e.target.value)}
                                        className="w-full p-2 sm:p-3 border rounded-lg bg-gray-50 text-sm sm:text-base"
                                        rows={4}
                                        placeholder="Share your feedback about this student"
                                    ></textarea>
                                </div>

                                {ratingError && (
                                    <div className="text-red-500 text-sm">{ratingError}</div>
                                )}

                                {ratingSuccess && (
                                    <div className="text-green-500 text-sm">{ratingSuccess}</div>
                                )}

                                <div>
                                    <button
                                        onClick={handleSubmitRating}
                                        disabled={isSubmittingRating}
                                        className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors
                                            ${isSubmittingRating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                                    >
                                        <Star size={18} />
                                        <span>{isSubmittingRating ? 'Submitting...' : 'Submit Rating'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Company Feedback Section */}
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Student Feedbacks</h2>
                    {feedbackLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                        </div>
                    ) : feedbacks.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No feedback available
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                                {feedbacks.map((feedback) => (
                                    <FeedbackCard
                                        key={feedback.ratingId}
                                        rater={feedback.raterUserName}
                                        jobTitle={feedback.jobTitle}
                                        rating={feedback.score}
                                        review={feedback.comment}
                                        date={new Date(feedback.createdAt).toLocaleDateString()}
                                    />
                                ))}
                            </div>
                            
                            {/* Pagination controls */}
                            {totalFeedbacks > feedbackPageSize && (
                                <div className="flex justify-center items-center space-x-4 mt-6">
                                    <button 
                                        onClick={() => handlePageChange(feedbackPage - 1)}
                                        disabled={feedbackPage === 0}
                                        className={`px-3 py-1 rounded ${feedbackPage === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                                    >
                                        Previous
                                    </button>
                                    <div className="flex space-x-2">
                                        {[...Array(Math.min(5, Math.ceil(totalFeedbacks / feedbackPageSize)))].map((_, idx) => {
                                            const pageNumber = feedbackPage <= 2 ? idx : 
                                                             feedbackPage >= Math.ceil(totalFeedbacks / feedbackPageSize) - 3 ? 
                                                             Math.ceil(totalFeedbacks / feedbackPageSize) - 5 + idx : 
                                                             feedbackPage - 2 + idx;
                                            
                                            if (pageNumber < 0 || pageNumber >= Math.ceil(totalFeedbacks / feedbackPageSize)) {
                                                return null;
                                            }
                                            
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => handlePageChange(pageNumber)}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                        pageNumber === feedbackPage ? 'bg-blue-500 text-white' : 'bg-gray-200'
                                                    }`}
                                                >
                                                    {pageNumber + 1}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button 
                                        onClick={() => handlePageChange(feedbackPage + 1)}
                                        disabled={feedbackPage >= Math.ceil(totalFeedbacks / feedbackPageSize) - 1}
                                        className={`px-3 py-1 rounded ${
                                            feedbackPage >= Math.ceil(totalFeedbacks / feedbackPageSize) - 1 ? 
                                            'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
                                        }`}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Report Popup */}
            <ReportPopup 
                isOpen={isReportPopupOpen}
                onClose={() => setIsReportPopupOpen(false)}
                reportedUserId={viewUserId}
                currentUserId={currentUserId}
            />
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

// Update the FeedbackCard component to match the API data structure
function FeedbackCard({ rater, jobTitle, rating, review, date }) {
    // Generate an initial avatar based on the rater's name for consistency
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(rater)}&background=random`;
    
    return (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center space-x-4 mb-4">
                <img src={avatarUrl} alt={rater} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover" />
                <div>
                    <h3 className="font-semibold text-sm sm:text-base">{rater}</h3>
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
            <div className="mb-3">
                <p className="text-xs text-gray-500">{date}</p>
                <p className="text-sm font-medium text-gray-700">{jobTitle}</p>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm">{review || 'No additional comments provided.'}</p>
        </div>
    );
}

export default App;