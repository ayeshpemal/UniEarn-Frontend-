import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as solidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";

const JobReview = () => {
    // Sample Reviews
    const reviews = [
        {
            id: 1,
            name: "Floyd Miles",
            image: "https://randomuser.me/api/portraits/women/44.jpg",
            rating: 4.5,
            comment: "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint.",
        },
        {
            id: 2,
            name: "Ronald Richards",
            image: "https://randomuser.me/api/portraits/men/45.jpg",
            rating: 5,
            comment: "ullamco est sit aliqua dolor do amet sint. Veit officia consequat.",
        },
        {
            id: 3,
            name: "Savannah Nguyen",
            image: "https://randomuser.me/api/portraits/women/46.jpg",
            rating: 4,
            comment: "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint.",
        },
    ];

    // Rating & Feedback State
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");

    // Handle Rating Selection
    const handleRating = (rate) => {
        setUserRating(rate);
    };

    // Handle Comment Input
    const handleCommentChange = (e) => {
        setComment(e.target.value);
    };

    // Submit Feedback
    const handleSubmit = () => {
        if (userRating === 0) {
            alert("Please select a rating before submitting.");
            return;
        }
        alert(`Feedback Submitted!\nRating: ${userRating} Stars\nComment: ${comment}`);
        setUserRating(0);
        setComment("");
    };

    return (
        <div className="max-w-5xl mx-auto my-10 p-6 bg-white shadow-lg rounded-lg">
            {/* Hero Section */}
            <div
                className="relative h-[70vh] bg-cover bg-center flex items-center justify-center"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80")',
                }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-50">
                    <div className="max-w-7xl mx-auto h-full flex flex-col justify-center px-6">
                        <h1 className="text-7xl font-bold text-white">
                            Contact
                            <br />
                            <span className="text-[#6B7AFF]">Us</span>
                        </h1>
                    </div>
                </div>
            </div>
            {/* Company Info */}
            <div className="text-center">
                <img
                    src="./profile.png"
                    alt=""
                    className="mx-auto rounded-full"
                />
                <h2 className="text-2xl font-bold mt-4">K&D Garment</h2>

                {/* Star Rating */}
                <div className="flex justify-center mt-2 text-yellow-400">
                    {[...Array(5)].map((_, index) => (
                        <FontAwesomeIcon key={index} icon={index < 4 ? solidStar : regularStar} className="text-xl mx-1" />
                    ))}
                </div>

                <h3 className="mt-4 font-semibold text-lg">What our students say about us</h3>
            </div>

            {/* Reviews Section */}
            <div className="grid md:grid-cols-3 gap-6 my-6">
                {reviews.map((review) => (
                    <div key={review.id} className="p-4 bg-gray-100 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <img
                                src={review.image}
                                alt={review.name}
                                className="w-10 h-10 rounded-full mr-3"
                            />
                            <div>
                                <h4 className="font-bold">{review.name}</h4>
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, index) => (
                                        <FontAwesomeIcon key={index} icon={index < Math.floor(review.rating) ? solidStar : regularStar} className="text-sm" />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
                    </div>
                ))}
            </div>

            {/* User Rating Section */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold">Rate this job</h3>
                <div className="flex mt-2 text-yellow-400">
                    {[...Array(5)].map((_, index) => (
                        <FontAwesomeIcon
                            key={index}
                            icon={index < (hoverRating || userRating) ? solidStar : regularStar}
                            className="text-2xl cursor-pointer mx-1"
                            onMouseEnter={() => setHoverRating(index + 1)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => handleRating(index + 1)}
                        />
                    ))}
                </div>
            </div>

            {/* Feedback Input */}
            <div className="mt-4">
                <textarea
                    placeholder="Add your comments..."
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={comment}
                    onChange={handleCommentChange}
                />
            </div>

            {/* Submit Button */}
            <div className="mt-4 text-center">
                <button
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                    onClick={handleSubmit}
                >
                    Send Feedback
                </button>
            </div>
        </div>
    );
};

export default JobReview;
