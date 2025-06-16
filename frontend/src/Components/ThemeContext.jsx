import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // State to hold the current theme mode (true for dark, false for light)
    const [isDark, setIsDark] = useState(() => {
        // Initialize state from localStorage or system preference on first render
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            return true;
        }
        // Check system preference if no theme is explicitly saved
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return true;
        }
        return false;
    });

    // useEffect to apply the theme class to the document body and save to localStorage
    useEffect(() => {
        if (isDark) {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode'); 
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]); // Re-run this effect whenever isDark changes

    // Function to toggle the theme
    const toggleTheme = () => {
        setIsDark(prevIsDark => !prevIsDark);
    };

    // Provide the theme state and toggle function to children components
    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook to easily consume the theme context in any component
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;