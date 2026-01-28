import { Link } from "react-router-dom";
import "../app.css";
import React, { useState, createContext, useContext, useEffect, useRef } from "react";
// import { auth } from "../firebase"; 
import { onAuthStateChanged, signOut} from "firebase/auth";
import type { User } from "firebase/auth";
import { useNavigate } from "react-router-dom";

type NavigationContextType = {
    isVisible: boolean;
    toggleVisibility: () => void;
    closeMenu: () => void;
};

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
    const [isVisible, setIsVisible] = useState(false);
    
    return (
        <NavigationContext.Provider 
            value={{
                isVisible,
                toggleVisibility: () => setIsVisible(!isVisible),
                closeMenu: () => setIsVisible(false)
            }}
        >
            {children}
        </NavigationContext.Provider>
    );
}

function useNavigation() {
    const context = useContext(NavigationContext);
    if (context === undefined) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
}

type navParams = {
    navType: string;
};

const MobileNav = React.forwardRef<HTMLDivElement, navParams>((props, ref) => {
    const { isVisible } = useNavigation();
    const [user, setUser] = useState<User | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // useEffect(() => {
    //     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    //         setUser(currentUser);
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
    //         await signOut(auth);
    //         navigate("/login");
    //         setDropdownOpen(false);
    //     } catch (err) {
    //         console.error("Logout error:", err);
    //     }
    // };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    
    const menuStyles = `
        flex flex-col justify-center items-center 
        mt-10 relative right-5 p-7 rounded-xl 
        backdrop-blur-[100px] bg-black/80 
        transform transition-all duration-500 ease-in-out
        ${isVisible ? 'translate-y-0 opacity-100 visible' : '-translate-y-5 opacity-0 hidden pointer-events-none'}
    `;

    const navItems = [
        { path: '/', label: 'Home', type: 'home', width: 'w-[60px]' },
        { path: '/store', label: 'Store', type: 'store', width: 'w-[60px]' },
        { path: '/Gametype', label: 'Gametype', type: 'gametype', width: 'w-[100px]' },
    ];

    const renderNavItems = () => (
        navItems.map((item) => (
            <li key={item.type} className="relative inline-block cursor-pointer group">
                <span 
                    className={`${item.type === props.navType ? item.width : `group-hover:${item.width}`} absolute left-0 bottom-0 h-[3px] bg-[#d4a35d] w-0 transition-all duration-300`}
                />
                <Link to={item.path} className="text-[#f5f5dc]">
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
            <li className="relative inline-block cursor-pointer group text-center mb-1">
                <Link to='/signup' className="text-[#f5f5dc]">Sign Up</Link>
            </li>
            <li className="relative inline-block cursor-pointer group text-center">
                <Link to='/login' className="bg-white p-2 rounded-[30px] text-black">Log In</Link>
            </li>
        </>
    );

    return (
        <div ref={ref} className={menuStyles}>
            <div>
                <ul className="flex flex-col gap-5">
                    {renderNavItems()}
                    <hr className="text-white bg-white w-[120px] relative top-3 -mt-2 mb-2 h-[2px] opacity-60" />
                    {user ? renderUserDropdown() : renderAuthButtons()}
                </ul>
            </div>
        </div>
    );
});

function NavigationWrapper({ children }: { children: React.ReactNode }) {
    const { isVisible, closeMenu } = useNavigation();
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isVisible && 
                menuRef.current && 
                buttonRef.current && 
                !menuRef.current.contains(event.target as Node) && 
                !buttonRef.current.contains(event.target as Node)) {
                closeMenu();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isVisible, closeMenu]);

    return (
        <div>
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    if (child.type === MobileNav) {
                        return React.cloneElement(child as React.ReactElement<navParams & React.RefAttributes<HTMLDivElement>>, { ref: menuRef });
                    }
                    if (child.type === 'button') {
                        return React.cloneElement(child as React.ReactElement<any>, { ref: buttonRef });
                    }
                }
                return child;
            })}
        </div>
    );
}

function HamburgerBtn(props: navParams) {
    const { toggleVisibility, isVisible } = useNavigation();

    return (
        <NavigationWrapper>
            <button 
                className="flex flex-col gap-1 absolute right-5 rounded-full z-1000" 
                onClick={toggleVisibility}
            >
                <div 
                    style={{ backgroundColor: "var(--text-primary)" }} 
                    className={`border w-7 h-1 transition-all duration-300 ${
                        isVisible ? 'rotate-45 translate-y-2' : ''
                    }`}
                />
                <div 
                    style={{ backgroundColor: "var(--text-primary)" }} 
                    className={`border w-7 h-1 bg-white transition-all duration-300 ${
                        isVisible ? 'opacity-0' : 'opacity-100'
                    }`}
                />
                <div 
                    style={{ backgroundColor: "var(--text-primary)" }} 
                    className={`border w-7 h-1 bg-white transition-all duration-300 ${
                        isVisible ? '-rotate-45 -translate-y-2' : ''
                    }`}
                />
            </button>
            <MobileNav navType={props.navType} />
        </NavigationWrapper>
    );
}

MobileNav.displayName = 'MobileNav';

export default HamburgerBtn;