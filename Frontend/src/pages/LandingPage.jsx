import React from 'react';
import mobile from '../assets/mobile.png';
import { FaVideo, FaComments } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="h-[calc(100vh-4.5rem)] w-full relative z-10 flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-6">
            {/* Left Text Section */}
            <div className="flex flex-col w-full md:w-1/2 text-center md:text-left mb-8 md:mb-0">
                <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                    <span className='text-red-600'>connect</span> with your loved ones
                </h1>
                <p className="text-white text-xl sm:text-2xl font-semibold flex justify-center md:justify-start items-center gap-2">
                    cover a distance by video call 
                    <FaVideo className="text-blue-400 text-3xl sm:text-4xl shadow-lg" />
                </p>
            </div>

            {/* Right Image Section with Two Mobiles & Icons */}
            <div className="relative w-full md:w-1/2 h-[300px] sm:h-[400px] md:h-full flex items-center justify-center">
                {/* Left Mobile + Video Icon */}
                <div className="absolute top-0 left-6 sm:left-10 rotate-[-20deg] flex items-center gap-3">
                    <FaVideo className="text-blue-400 text-3xl sm:text-4xl shadow-lg" />
                    <div className="bg-blue-500 p-3 sm:p-4 rounded-xl shadow-lg">
                        <img src={mobile} alt="Mobile Left" className="w-28 sm:w-36 md:w-40 h-auto" />
                    </div>
                </div>

                {/* Right Mobile + Chat Icon */}
                <div className="absolute bottom-4 right-6 sm:right-10 rotate-[20deg] flex items-center gap-3">
                    <div className="bg-green-500 p-3 sm:p-4 rounded-xl shadow-lg">
                        <img src={mobile} alt="Mobile Right" className="w-28 sm:w-36 md:w-40 h-auto" />
                    </div>
                    <FaComments className="text-green-300 text-3xl sm:text-4xl shadow-lg" />
                </div>
            </div>

            {/* Bottom-right corner credit */}
            <a href='https://sourabhnegi.netlify.app/' className="absolute bottom-2 right-4 text-sm underline text-white opacity-70">created by <span className='text-yellow-500 font-semibold un'>Sourabh</span> </a>
            
        </div>
    );
};

export default LandingPage;
