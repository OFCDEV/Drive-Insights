import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button 
      onClick={toggleTheme}
      className={`p-2 rounded-full bg-primary-800 hover:bg-primary-700 transition-colors duration-200 ${className}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun size={20} className="text-yellow-300" />
      ) : (
        <Moon size={20} className="text-gray-100" />
      )}
    </button>
  );
};

export default ThemeToggle; 