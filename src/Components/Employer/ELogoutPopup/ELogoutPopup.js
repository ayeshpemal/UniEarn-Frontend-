import React from "react";

const ELogoutPopup = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-blue-600/70 p-6 rounded-lg shadow-purple-500 text-center w-80 relative">
                <h2 className="text-lg font-bold mb-4">Are you sure you want to log out?</h2>

                <div className="flex justify-center space-x-4">
                    <button
                        onClick={onConfirm}
                        className="bg-red-400 text-white px-5 py-2 rounded-lg hover:bg-red-600"
                    >
                        Yes
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-300 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-400"
                    >
                        No
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ELogoutPopup;
