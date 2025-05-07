import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  Fuel, 
  Gauge, 
  Wind, 
  Menu, 
  X 
} from 'lucide-react';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
      <header className="bg-primary text-white shadow-md">
        <div className="container py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Car size={28} className="text-accent" />
            <h1 className="text-xl font-bold">Drive Insights</h1>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-md hover:bg-primary-800"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <aside className={`
          ${isMobileMenuOpen ? 'block' : 'hidden'} 
          md:block bg-white shadow-md w-64 fixed md:static inset-y-0 mt-16 md:mt-0 z-10
        `}>
          <nav className="p-4 space-y-1">
            {navItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.to}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-4 py-3 rounded-md transition-colors
                  ${isActive 
                    ? 'bg-primary text-white' 
                    : 'text-gray-700 hover:bg-secondary hover:text-primary'}
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                <span>{item.text}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-primary-800 text-white py-4">
        <div className="container text-center">
          <p>&copy; {new Date().getFullYear()} Drive Insights. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 