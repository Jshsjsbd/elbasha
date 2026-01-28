import { Link } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import HamburgerBtn from "./MobileNav";
import { useTranslation } from "react-i18next";

type HeaderParams = {
  type: string;
};

function Header(props: HeaderParams) {
    const [hidden, setHidden] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleClick = () => {
        setHidden(!hidden);
    };

    // Check for user session on mount and when storage changes
    useEffect(() => {
        const userSession = localStorage.getItem("userSession");
        if (userSession) {
            setUser(JSON.parse(userSession));
        }

        // Listen for storage changes (logout from other tabs)
        const handleStorageChange = () => {
            const updated = localStorage.getItem("userSession");
            setUser(updated ? JSON.parse(updated) : null);
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const getInitials = (username: string | null) => {
        if (!username) return "";
        return username.substring(0, 2).toUpperCase();
    };

    const handleDiscordLogin = () => {
        // Get from environment or use placeholder
        const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
        
        if (!clientId || clientId === "YOUR_DISCORD_CLIENT_ID") {
            alert("Discord login is not configured. Please contact the server administrator.");
            return;
        }

        const redirectUri = encodeURIComponent(
            `${window.location.origin}/auth/discord/callback`
        );
        const scope = encodeURIComponent("identify email guilds");
        window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    };

    const handleLogout = () => {
        localStorage.removeItem("userSession");
        setUser(null);
        window.location.href = "/";
    };

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
        { path: '/applications', label: 'Applications', type: 'applications' }
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
                className="w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-sm border-2 border-orange-500 hover:border-orange-400 cursor-pointer transition-colors"
                style={{ backgroundColor: "var(--accent-color)" }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                title={user?.username}
            >
                <img
                    src={user?.avatar}
                    alt={user?.username}
                    className="w-full h-full rounded-full"
                    onError={(e) => {
                        e.currentTarget.style.display = "none";
                    }}
                />
            </div>

            {dropdownOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-xl shadow-lg ring-1 ring-orange-500 border border-orange-500 transform transition-all duration-200 origin-top"
                >
                    <div className="px-4 py-3 border-b border-orange-500">
                        <p className="text-white font-bold text-sm">{user?.username}</p>
                        <p className="text-orange-300 text-xs">{user?.email}</p>
                    </div>
                    <ul className="py-2">
                        <li>
                            <Link
                                to="/profile"
                                className="block px-4 py-2 text-sm text-slate-100 hover:bg-slate-700 transition-colors"
                                onClick={() => setDropdownOpen(false)}
                            >
                                👤 Profile
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/applications"
                                className="block px-4 py-2 text-sm text-slate-100 hover:bg-slate-700 transition-colors"
                                onClick={() => setDropdownOpen(false)}
                            >
                                📝 Applications
                            </Link>
                        </li>
                        <li className="border-t border-orange-500">
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors"
                            >
                                🚪 Logout
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </li>
    );

    const renderAuthButtons = () => (
        <li className="relative inline-block cursor-pointer group">
            <button 
                onClick={handleDiscordLogin}
                style={{ color: "var(--bg-primary)", backgroundColor: "#5865F2" }} 
                className="bg-white p-2 rounded-[30px] text-white font-bold hover:bg-opacity-90 transition-all flex items-center gap-2"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.3671C18.7873 3.54588 17.147 2.98468 15.418 2.7649C15.4121 2.76383 15.4063 2.76274 15.3995 2.76164C15.1558 2.71569 14.9118 2.80219 14.8848 3.02501C14.6547 5.1625C14.3871 7.0951 13.9054 8.8559 13.2202 10.3281C11.7383 10.175 10.2854 10.175 8.84328 10.3281C8.15797 8.8559 7.6762 7.0951 7.44608 5.1625C7.41906 4.80561 7.04952 4.57055 6.68538 4.66309C5.30988 5.00238 3.80746 5.4082 2.25214 6.15625C2.08625 6.2473 1.96402 6.41141 1.94631 6.60547C0.704692 12.6851 1.7035 18.0711 5.18328 20.7257C5.32945 20.8404 5.51589 20.8959 5.69832 20.8783C7.13896 20.7712 8.54795 20.4441 9.86245 19.9265C10.0701 19.8451 10.2077 19.6788 10.2423 19.4878C10.5589 17.8035 10.8034 15.9363 10.8034 14.0227C10.8034 13.4743 11.2502 13.0274 11.7986 13.0274C12.3469 13.0274 12.7938 13.4743 12.7938 14.0227C12.7938 15.9363 13.0383 17.8035 13.3549 19.4878C13.3895 19.6788 13.527 19.8451 13.7347 19.9265C15.0492 20.4441 16.4582 20.7712 17.8989 20.8783C18.0813 20.8959 18.2677 20.8404 18.4139 20.7257C21.8936 18.0711 22.9925 12.6851 21.7509 6.60547C21.7332 6.41141 21.611 6.2473 21.4451 6.15625Z"/>
                </svg>
                Login with Discord
            </button>
        </li>
    );

    return (
        <div className="flex justify-center items-center sticky top-0 z-1000">
            <div 
                className="absolute top-0 backdrop-blur-xl flex justify-between items-center h-15 w-full items-center z-1000 custom-styles" 
                style={{ boxShadow: '0 10px 15px -3px var(--shadow-color), 0 4px 6px -2px var(--shadow-color-light)' }}
            >
                <div className="flex items-center" style={{ color: "var(--text-primary)" }}>
                    <div className="flex items-center h-10 mr-2 absolute left-10 text-center text-xl font-bold">
                        <Link to='/' className="flex items-center flex-row">
                            <span className="text-lg font-bold">Mystic Network</span>
                        </Link>
                    </div>
                    
                    <div className="absolute right-6 font-bold hidden md:block">
                        <ul className="flex gap-5 items-center">
                            {renderNavItems()} 
                            <hr 
                                style={{ backgroundColor: "var(--text-accent)" }} 
                                className={`text-white bg-white w-[30px] rotate-90 relative ${user ? 'top-5' : 'top-3'} -ml-2 -mr-2 h-[2px] opacity-90`}
                            />
                            
                            {user ? renderUserDropdown() : renderAuthButtons()}
                        </ul>
                    </div>
                    
                    <div className="absolute top-4 right-2 flex flex-col font-bold block md:hidden" ref={menuRef}>
                        <HamburgerBtn navType={props.type} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Header;