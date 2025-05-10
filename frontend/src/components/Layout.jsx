import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  Fuel, 
  Gauge, 
  Wind, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, text: 'Dashboard' },
    { to: '/vehicles', icon: <Car size={20} />, text: 'Vehicles' },
    { to: '/fuel-consumption', icon: <Fuel size={20} />, text: 'Fuel Consumption' },
    { to: '/engine-monitoring', icon: <Gauge size={20} />, text: 'Engine Monitoring' },
    { to: '/emissions', icon: <Wind size={20} />, text: 'Emissions' }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white shadow-md z-20 transition-colors duration-300">
        <div className="container py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Car size={28} className="text-accent" />
            <h1 className="text-xl font-bold">Drive Insights</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Theme Toggle Button */}
            <ThemeToggle />
            
            {/* Mobile menu button - only visible on small screens */}
            <button 
              className="md:hidden p-2 rounded-md hover:bg-primary-800"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar Navigation */}
        <aside 
          className={`
            bg-white shadow-md fixed md:relative inset-y-0 mt-16 md:mt-0 z-10 transition-all duration-300 ease-in-out
            ${isMobileMenuOpen ? 'left-0' : '-left-64 md:left-0'} md:block
            ${isSidebarCollapsed ? 'w-16' : 'w-64'}
            dark:bg-gray-800 dark:text-white
          `}
        >
          {/* Sidebar Toggle Button - only visible on non-mobile */}
          <button 
            className={`absolute -right-8 top-4 bg-primary text-white p-1 rounded-r-md shadow-md 
                        transition-all duration-300 hover:bg-primary-700 hover:shadow-lg
                        ${isMobile ? 'hidden' : 'block'}`}
            onClick={toggleSidebar}
          >
            {isSidebarCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>

          <nav className="p-4 space-y-1">
            {navItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.to}
                className={({ isActive }) => `
                  flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'} 
                  px-4 py-3 rounded-md transition-all duration-300
                  ${isActive 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-700 hover:bg-secondary hover:text-primary hover:shadow-md hover:-translate-y-0.5 dark:text-gray-200 dark:hover:bg-gray-700'}
                `}
                onClick={() => setIsMobileMenuOpen(false)}
                title={isSidebarCollapsed ? item.text : ''}
              >
                <div className="transition-transform duration-300 hover:scale-110">
                  {item.icon}
                </div>
                {!isSidebarCollapsed && <span>{item.text}</span>}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 transition-all duration-300">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-primary-800 text-white py-4 transition-colors duration-300 dark:bg-gray-900">
        <div className="container text-center">
          <p>&copy; {new Date().getFullYear()} Drive Insights. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 