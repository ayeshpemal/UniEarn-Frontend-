import React, { useState } from "react";
import companyLogo from "./job-logo.png"
import {Search} from "lucide-react";
import SearchBar from "../SearchBar/SearchBar";
import {useNavigate} from "react-router-dom";
import { useEffect } from "react";

// Replace with actual logo path

// const companies = Array(2).fill({
//     id: 1,
//     name: "K&D Garment",
//     logo: companyLogo,
// });

const Company = () => {

    const [employers, setEmployers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const onNavigateToEmployer =(employerId)=> {
        navigate("/company-details/${employerId}");
    }

    useEffect(() => {
        // Fetch jobs from the API using axios
        const fetchEmployers = async () => {
            try {
        
                const response = await axios.get(`http://localhost:8100/api/v1/jobs/studentpreferedjobs?student_id=${userId}&page=0`);//this should be the endpoint for fetching employers
                console.log(response);
                const employers = response.data?.data?.employerList || [];
                setEmployers(employers);
        
            } catch (err) {
                console.error("Error fetching employers:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployers();
    }, []);

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Companies Section */}
            <section className ="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 mt-6">
                <h2 className="text-2xl font-bold mb-4">Companies</h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {employers.map((employer, index) => (
                        <div key={index} className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center">
                            <img src={company.logo} alt={employer.companyName} className="w-16 h-16 rounded-full" />
                            <h3 className="text-md font-semibold text-gray-700 mt-2">{employer.companyName}</h3>
                            <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded-full flex items-center hover:bg-green-600 transition-colors" onClick={(onNavigateToEmployer(employer.userId))}>
                                View Company
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Company;
