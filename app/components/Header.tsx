import { Link } from "react-router";
import React, { useEffect, useRef, useState } from "react";
import HamburgerBtn from "./MobileNav";
// import { auth } from "../firebase"; 
import { onAuthStateChanged, signOut} from "firebase/auth";
import type { User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import mysticNetwork from "../assets/mysticNetwork.png";
import { useTranslation } from "react-i18next";

type HeaderParams = {
  type: string;
};

function Header(props: HeaderParams) {
    const [hidden, setHidden] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const handleClick = () => {
        setHidden(!hidden);
    };

    // useEffect(() => {
    //     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    //     setUser(currentUser);
    //     });

    //     return () => unsubscribe();
    // }, []);

    const getInitials = (displayName: string | null, email: string | null) => {
        let name = displayName || email || "";
        if (!name) return "";

        const parts = name.trim().split(" ");
        if (parts.length === 1) {
        return parts[0][0].toUpperCase();
        } else {
        return (parts[0][0] + parts[1][0]).toUpperCase();
        }
    };

    // const handleLogout = async () => {
    //     try {
    //     await signOut(auth);
    //     navigate("/login");
    //     setDropdownOpen(false);
    //     } catch (err) {
    //     console.error("Logout error:", err);
    //     }
    // };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
            menuRef.current &&
            !menuRef.current.contains(event.target as Node) &&
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
            ) {
            setHidden(true);
            setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const navItems = [
        { path: '/', label: 'Home', type: 'home' },
        { path: '/store', label: 'Store', type: 'store' },
        { path: '/Gametype', label: 'Gametype', type: 'gametype' }
    ];

    const renderNavItems = () => (
        navItems.map((item) => (
            <li key={item.type} className="relative inline-block cursor-pointer group">
                <span 
                    className={`${item.type === props.type ? 'w-full' : 'group-hover:w-full'} absolute left-0 bottom-0 h-[3px] w-0 transition-all duration-300`}
                    style={{ backgroundColor: "var(--accent-color)" }}
                />
                <Link to={item.path} className={user ? "relative top-2" : ""}>
                    {item.label}
                </Link>
            </li>
        ))
    );

    const renderUserDropdown = () => (
        <li className="relative inline-block cursor-pointer group">
            <div
                className="w-10 h-10 flex items-center justify-center rounded-full text-white font-bold"
                style={{ backgroundColor: "var(--accent-color)" }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
            >
                {getInitials(
                    user?.displayName ?? null,
                    user?.email ?? null
                )}
            </div>

            {dropdownOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 transform transition-all duration-200 origin-top scale-95 opacity-0 animate-fadeIn"
                    style={{ animation: "fadeIn 0.2s forwards" }}
                >
                    <ul className="py-2">
                        <li>
                            <Link
                                to="/profile"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setDropdownOpen(false)}
                            >
                                Profile
                            </Link>
                        </li>
                        <li>
                            <button
                                // onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </li>
    );

    const renderAuthButtons = () => (
        <>
            <li className="relative inline-block cursor-pointer group">
                <Link to='/signup'>Sign Up</Link>
            </li>
            <li className="relative inline-block cursor-pointer group">
                <Link 
                    to='/login' 
                    style={{ color: "var(--bg-primary)", backgroundColor: "var(--text-primary)" }} 
                    className="bg-white p-2 rounded-[30px] text-black"
                >
                    Log In
                </Link>
            </li>
        </>
    );

    return (
        <div className="flex justify-center items-center sticky top-0 z-1000">
            <div 
                className="absolute top-0 backdrop-blur-xl flex justify-between items-center h-20 w-full items-center z-1000 custom-styles" 
                style={{ boxShadow: '0 10px 15px -3px var(--shadow-color), 0 4px 6px -2px var(--shadow-color-light)' }}
            >
                <div className="flex items-center" style={{ color: "var(--text-primary)" }}>
                    <div className="flex items-center h-10 mr-2 absolute left-8 text-center text-xl font-bold">
                        <Link to='/' className="flex items-center flex-row">
                            <img src={mysticNetwork} alt="Mystic Network Logo" className="w-30 h-10 mr-2" />
                        </Link>
                    </div>
                    
                    <div className="absolute right-6 font-bold hidden md:block">
                        <ul className="flex gap-5">
                            {renderNavItems()}
                            
                            <hr 
                                style={{ backgroundColor: "var(--text-accent)" }} 
                                className={`text-white bg-white w-[30px] rotate-90 relative ${user ? 'top-5' : 'top-3'} -ml-2 -mr-2 h-[2px] opacity-90`}
                            />
                            
                            {user ? renderUserDropdown() : renderAuthButtons()}
                        </ul>
                    </div>
                    
                    <div className="absolute top-8 right-2 flex flex-col font-bold block md:hidden" ref={menuRef}>
                        <HamburgerBtn navType={props.type} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Header;