import React, { useState, useEffect } from 'react';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Get initial theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setIsDark(initialTheme === 'dark');
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.style.setProperty('--bg-primary', '#242436');
      root.style.setProperty('--text-primary', '#f5f5dc');
      root.style.setProperty('--accent-color', '#d4a35d');
      root.style.setProperty('--border-color', 'rgba(212, 163, 93, 0.2)');
      root.style.setProperty('--scrollbar-thumb', '#daaa3d');
      root.style.setProperty('--text-secondary', '#e6e6cc');
      root.style.setProperty('--text-accent', '#F2B705');
      root.style.setProperty('--button-bg', '#daaa3d');
      root.style.setProperty('--button-hover', '#1E5AA8');
      root.style.setProperty('--shadow-color', 'rgba(255, 255, 255, 0.35)');
      root.style.setProperty('--shadow-color-light', 'rgba(255, 255, 255, 0.2)');
      root.style.setProperty('--particle-color', 'white');
      document.body.style.background = '#242436';
      document.body.style.color = '#f5f5dc';
    } else {
      root.style.setProperty('--bg-primary', '#f8f9fa');
      root.style.setProperty('--text-primary', '#2c3e50');
      root.style.setProperty('--accent-color', '#d4a35d');
      root.style.setProperty('--border-color', 'rgba(212, 163, 93, 0.3)');
      root.style.setProperty('--scrollbar-thumb', '#d4a35d');
      root.style.setProperty('--text-secondary', '#34495e');
      root.style.setProperty('--text-accent', '#F2B705');
      root.style.setProperty('--button-bg', '#daaa3d');
      root.style.setProperty('--button-hover', '#1E5AA8');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.35)');
      root.style.setProperty('--shadow-color-light', 'rgba(0, 0, 0, 0.2)');
      root.style.setProperty('--particle-color', 'black');
      document.body.style.background = '#f8f9fa';
      document.body.style.color = '#2c3e50';
    }
  };

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <button
        onClick={toggleTheme}
        className="relative w-14 h-14 bg-gradient-to-br from-[#d4a35d] to-[#daaa3d] rounded-full transform hover:scale-105 transition-all duration-300 ease-in-out group"
        style={{ boxShadow: '0 10px 15px -3px var(--shadow-color), 0 4px 6px -2px var(--shadow-color-light)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 20px 25px -5px var(--shadow-color), 0 10px 10px -5px var(--shadow-color-light)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 10px 15px -3px var(--shadow-color), 0 4px 6px -2px var(--shadow-color-light)';
        }}
        // aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#d4a35d] to-[#daaa3d] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
        
        <div className="relative flex items-center justify-center w-full h-full">
          {isDark ? (
            // Sun icon for dark mode
            <svg
              className="w-6 h-6 text-white transform transition-all duration-300 ease-in-out"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            // Moon icon for light mode
            <svg
              className="w-6 h-6 text-white transform transition-all duration-300 ease-in-out"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </div>

        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-black/80 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          {/* {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'} */}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
        </div>
      </button>
    </div>
  );
};

export default ThemeToggle;
