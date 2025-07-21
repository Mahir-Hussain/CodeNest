import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // State to hold the current theme mode (true for dark, false for light)
    const [isDark, setIsDark] = useState(() => {
        // Check localStorage first (for persistence between sessions)
        const savedTheme = localStorage.getItem('theme');
        console.log('Saved theme:', savedTheme);
        if (savedTheme === 'dark') {
            return true;
        }
        if (savedTheme === 'light') {
            return false;
        }
        // Default to light mode if no preference is saved
        return false;
    });

    // Function to fetch theme preference from backend
    const fetchThemeFromBackend = async () => {
        localStorage.setItem('theme', 'light'); // Clear localStorage theme to avoid conflicts
        // try {
        //     const token = localStorage.getItem('authToken');
        //     if (!token) return; // No token, keep current theme
            
        //     const API_URL = import.meta.env.VITE_API_URL;
        //     const response = await fetch(`${API_URL}/dark_mode`, {
        //         method: 'GET',
        //         headers: {
        //             'Authorization': `Bearer ${token}`,
        //             'Content-Type': 'application/json',
        //         },
        //     });

        //     if (response.ok) {
        //         const result = await response.json();
        //         const backendDarkMode = result.dark_mode;
        //         setIsDark(backendDarkMode);
        //         // Save to localStorage
        //         localStorage.setItem('theme', backendDarkMode ? 'dark' : 'light');
        //     }
        // } catch (error) {
        //     console.error('Failed to fetch theme from backend:', error);
        // }
    };

    // Load theme from backend on mount (if user is logged in)
    useEffect(() => {
        fetchThemeFromBackend();
    }, []);

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

    // Function to clear theme on logout
    const clearTheme = () => {
        localStorage.removeItem('theme');
        setIsDark(false); // Reset to light mode
    };

    // Provide the theme state and functions to children components
    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, clearTheme, fetchThemeFromBackend }}>
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