import ESearchBar from "../ESearchBar/ESearchBar";

const EHeroSectionHome = () => {
    return (
        <div>
            {/* Hero Section */}
            <div
                className="relative h-[60vh] bg-cover bg-center"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80")' }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/40 backdrop-blur-[1px]">
                    <div className="max-w-7xl mx-auto h-full flex flex-col justify-end pb-24 px-4 sm:px-6">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-md mt-20">
                            Find perfect<br />
                            <span className="text-blue-400 drop-shadow-lg">candidates</span> for Job
                        </h1>
                        <p className="mt-3 text-white/90 text-lg sm:text-xl max-w-2xl drop-shadow-sm">
                            Connect with skilled students ready to work on your projects
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EHeroSectionHome;