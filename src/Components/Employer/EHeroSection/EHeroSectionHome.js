import ESearchBar from "../ESearchBar/ESearchBar";

const EHeroSectionHome = () =>{

    return(
       
       <div>
        {/* Hero Section */}
        <header
                className="relative flex flex-col justify-center items-center text-white text-align h-[70vh] bg-cover bg-center px-6"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80")' }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-50" />
                <div className="relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white">
                        Find Your Perfect <br />
                        <span className="text-blue-400">Part-Time</span> Job
                    </h1>

                    <ESearchBar />
                </div>
            </header>
        </div>
    );
};
export default EHeroSectionHome;