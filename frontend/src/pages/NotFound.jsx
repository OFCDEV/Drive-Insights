import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold text-primary dark:text-primary-300 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Page Not Found</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/" className="btn btn-primary inline-flex items-center space-x-2">
        <Home size={18} />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFound; 