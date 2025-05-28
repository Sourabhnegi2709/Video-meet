import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import meet from '../assets/meet.png';

function Home() {
    const [roomId, setRoomId] = useState('');
    const navigate = useNavigate();

    const handleJoin = () => {
        const id = roomId.trim();
        if (id) navigate(`/room/${id}`);
    };

    const generateRandomId = () => {
        const randomId = Math.random().toString(36).substring(2, 10);
        setRoomId(randomId);
    };

    return (
        <div className="h-[calc(100vh-4.5rem)] w-full overflow-hidden flex flex-col-reverse md:flex-row items-center justify-center px-4 md:px-12 gap-10">

            {/* Text Section */}
            <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight drop-shadow-md">
                    Connect to Your <span className="text-yellow-400">Loved Ones</span>
                </h1>

                <p className="text-lg text-gray-200">
                    Enter a Room ID or generate one to get started.
                </p>

                <p className="text-sm font-medium text-gray-300">
                    <span className="font-bold text-red-400">Note:</span> Use the same Room ID on the next page to join.
                </p>

                <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Enter Room ID"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />

                <button
                    onClick={handleJoin}
                    disabled={!roomId.trim()}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded-lg transition disabled:opacity-50"
                >
                    Join Room
                </button>

                <button
                    onClick={generateRandomId}
                    className="w-full border border-yellow-400 text-yellow-400 hover:bg-yellow-100 font-semibold py-2 rounded-lg transition"
                >
                    Generate Random Room ID
                </button>
            </div>

            {/* Image Section with BG + Rounded */}
            <div className="w-full md:w-1/2 h-full flex items-center justify-center">
                <div className="bg-teal-600 max-h-[400px] w-full max-w-md p-4 rounded-3xl shadow-2xl flex items-center justify-center">
                    <img
                        src={meet}
                        alt="Connect"
                        className="w-full object-contain rounded-2xl"
                    />
                </div>
            </div>

        </div>
    );
}

export default Home;
