import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const VehicleList = () => {
  // State for both API vehicles and mock vehicles
  const [apiVehicles, setApiVehicles] = useState([]);
  const [mockVehicles, setMockVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMockData, setShowMockData] = useState(true); // Control whether to show mock data
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Create mock data
  useEffect(() => {
    const mockData = [
      { id: 'm1', make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'ABC123', fuelType: 'Gasoline', engineSize: 2.5 },
      { id: 'm2', make: 'Honda', model: 'Civic', year: 2019, licensePlate: 'XYZ789', fuelType: 'Gasoline', engineSize: 1.8 },
      { id: 'm3', make: 'Tesla', model: 'Model 3', year: 2021, licensePlate: 'EV1234', fuelType: 'Electric', engineSize: null },
      { id: 'm4', make: 'Ford', model: 'F-150', year: 2018, licensePlate: 'TRK456', fuelType: 'Diesel', engineSize: 3.5 },
      { id: 'm5', make: 'Chevrolet', model: 'Volt', year: 2020, licensePlate: 'HYB789', fuelType: 'Hybrid', engineSize: 1.5 },
    ];
    setMockVehicles(mockData);
  }, []);

  // Fetch real data from API
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        try {
          const response = await axios.get('/api/vehicles');
          setApiVehicles(response.data);
        } catch (err) {
          console.warn('Error fetching from API, using only mock data:', err);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch vehicles');
        setLoading(false);
        console.error(err);
      }
    };

    fetchVehicles();
  }, []);

  // Handle deleting a real vehicle
  const handleDelete = async (id, make, model) => {
    if (window.confirm(`Are you sure you want to delete ${make} ${model}?`)) {
      try {
        // Only attempt to delete from API if it's not a mock vehicle (mock IDs start with 'm')
        if (!id.toString().startsWith('m')) {
          await axios.delete(`/api/vehicles/${id}`);
          setApiVehicles(apiVehicles.filter(vehicle => vehicle.id !== id));
        } else {
          // If it's a mock vehicle, just remove from local state
          setMockVehicles(mockVehicles.filter(vehicle => vehicle.id !== id));
        }
      } catch (err) {
        console.error(`Error deleting vehicle ${id}:`, err);
        alert('Failed to delete vehicle. Please try again.');
      }
    }
  };

  // Combine both data sources if showMockData is true
  const allVehicles = showMockData ? [...apiVehicles, ...mockVehicles] : apiVehicles;

  // Filter vehicles based on search term
  const filteredVehicles = allVehicles.filter(vehicle => {
    const searchString = searchTerm.toLowerCase();
    return (
      vehicle.make.toLowerCase().includes(searchString) ||
      vehicle.model.toLowerCase().includes(searchString) ||
      vehicle.licensePlate.toLowerCase().includes(searchString) ||
      vehicle.year.toString().includes(searchString)
    );
  });

  if (loading && apiVehicles.length === 0 && mockVehicles.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-primary">Loading vehicles...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Vehicles</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your fleet of vehicles and view their details.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={showMockData}
                onChange={() => setShowMockData(!showMockData)}
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              <span className="ms-3 text-sm font-medium text-gray-700 dark:text-gray-300">Show Demo Data</span>
            </label>
          </div>
          <Link to="/vehicles/new" className="btn btn-primary inline-flex items-center space-x-2">
            <Plus size={18} />
            <span>Add Vehicle</span>
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search vehicles by make, model, or license plate..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-secondary dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Make</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Model</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Year</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">License Plate</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Fuel Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Engine Size</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Type</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary dark:divide-gray-600">
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className={`hover:bg-secondary-50 dark:hover:bg-gray-700 transition-colors duration-200 ${String(vehicle.id).startsWith('m') ? (isDark ? 'bg-blue-900/20' : 'bg-blue-50') : ''}`}>
                    <td className="px-4 py-3 text-sm dark:text-gray-300">{vehicle.make}</td>
                    <td className="px-4 py-3 text-sm dark:text-gray-300">{vehicle.model}</td>
                    <td className="px-4 py-3 text-sm dark:text-gray-300">{vehicle.year}</td>
                    <td className="px-4 py-3 text-sm dark:text-gray-300">{vehicle.licensePlate}</td>
                    <td className="px-4 py-3 text-sm dark:text-gray-300">{vehicle.fuelType}</td>
                    <td className="px-4 py-3 text-sm dark:text-gray-300">{vehicle.engineSize || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">
                      {String(vehicle.id).startsWith('m') ? 
                        <span className={`px-2 py-1 ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'} rounded-full text-xs font-medium`}>Demo</span> : 
                        <span className={`px-2 py-1 ${isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'} rounded-full text-xs font-medium`}>Real</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-sm flex justify-center space-x-2">
                      <Link 
                        to={String(vehicle.id).startsWith('m') ? `/vehicles` : `/vehicles/${vehicle.id}`}
                        className={`p-1.5 ${String(vehicle.id).startsWith('m') ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'text-primary dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'} rounded-full`}
                        title={String(vehicle.id).startsWith('m') ? 'View not available for demo data' : 'View'}
                        onClick={(e) => String(vehicle.id).startsWith('m') && e.preventDefault()}
                      >
                        <Eye size={18} />
                      </Link>
                      <Link 
                        to={String(vehicle.id).startsWith('m') ? `/vehicles` : `/vehicles/${vehicle.id}/edit`}
                        className={`p-1.5 ${String(vehicle.id).startsWith('m') ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'} rounded-full`}
                        title={String(vehicle.id).startsWith('m') ? 'Edit not available for demo data' : 'Edit'}
                        onClick={(e) => String(vehicle.id).startsWith('m') && e.preventDefault()}
                      >
                        <Edit size={18} />
                      </Link>
                      <button 
                        className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                        title="Delete"
                        onClick={() => handleDelete(vehicle.id, vehicle.make, vehicle.model)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No vehicles match your search criteria.' : 'No vehicles found. Add a vehicle to get started!'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VehicleList; 