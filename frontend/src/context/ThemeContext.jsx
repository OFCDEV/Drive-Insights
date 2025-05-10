import React, { createContext, useState, useEffect, useContext } from 'react';

// Create a new context for theme management
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check if user has a theme preference in localStorage
  const getInitialTheme = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedPrefs = window.localStorage.getItem('color-theme');
      if (typeof storedPrefs === 'string') {
        return storedPrefs;
      }

      // If user has set theme preference in browser
      const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
      if (userMedia.matches) {
        return 'dark';
      }
    }

    // Default theme
    return 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Toggle between light and dark theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    updateTheme(newTheme);
  };

  // Set the theme by updating DOM
  const updateTheme = (newTheme) => {
    const root = window.document.documentElement;
    
    // Remove the previous theme class and add the new one
    root.classList.remove(theme === 'dark' ? 'dark' : 'light');
    root.classList.add(newTheme === 'dark' ? 'dark' : 'light');

    // Update localStorage
    localStorage.setItem('color-theme', newTheme);
  };

  // Set up the theme when component mounts
  useEffect(() => {
    updateTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 