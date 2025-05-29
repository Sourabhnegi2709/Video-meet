import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../services/api';
import { AiFillHome } from 'react-icons/ai';

function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Check login status on route change
    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, [location.pathname]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
        } catch (err) {
            console.warn('Logout request failed:', err.message);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsLoggedIn(false);
            navigate('/auth');
            setIsLoggingOut(false);
        }
    };

    return (
        <nav className="relative z-10 w-full h-[4.5rem] flex flex-wrap items-center justify-between px-4 sm:px-8 bg-black shadow-md">
            <div className="flex items-center gap-3 sm:gap-6">
                <Link to="/" className="text-[1.3rem] font-bold text-white">
                    Zoom
                </Link>
                {isLoggedIn && (
                    <Link
                        to="/home"
                        className="flex items-center text-[1.2rem] font-bold text-white gap-2"
                    >
                        <AiFillHome size={25} />
                        home
                    </Link>
                )}
            </div>

            <div className="flex items-center gap-4 sm:gap-6 mt-2 sm:mt-0">
                {isLoggedIn && (
                    <>

                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="text-white text-[1rem] sm:text-[1.2rem] font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                        </button>
                    </>
                )}

                {!isLoggedIn && (
                    <>
                        <Link
                            to="/home"
                            className="text-white text-[1rem] sm:text-[1.2rem] font-medium hover:underline"
                        >
                            Join as Guest
                        </Link>
                        <Link
                            to="/auth"
                            className="text-white text-[1rem] sm:text-[1.2rem] font-medium hover:underline"
                        >
                            Login / Signup
                        </Link>
                    </>
                )}
            </div>
        </nav>

    );
}

export default Navbar;
