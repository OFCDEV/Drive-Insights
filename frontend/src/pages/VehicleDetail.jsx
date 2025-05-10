import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit, Trash2, Car, Fuel, Gauge, Wind } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [fuelData, setFuelData] = useState([]);
  const [engineData, setEngineData] = useState([]);
  const [emissionData, setEmissionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        setLoading(true);
        
        // Fetch vehicle data
        const vehicleResponse = await axios.get(`/api/vehicles/${id}`);
        setVehicle(vehicleResponse.data);
        
        // Try to fetch fuel consumption data
        try {
          const fuelResponse = await axios.get(`/api/fuel-consumption/vehicle/${id}`);
          setFuelData(fuelResponse.data);
        } catch (err) {
          console.warn('Could not fetch fuel data:', err);
          // Use mock data if API call fails
          setFuelData([
            { date: '2023-01-15', amount: 12.5, distance: 350, mpg: 28.0, cost: 45.50 },
            { date: '2023-02-01', amount: 13.2, distance: 375, mpg: 28.4, cost: 48.75 },
            { date: '2023-02-15', amount: 12.8, distance: 360, mpg: 28.1, cost: 47.20 },
          ]);
        }
        
        // For engine data and emission data, we'll use mock data for now
        // In a real application, you would fetch this from actual APIs
        setEngineData([
          { date: '2023-02-01', temperature: 195.5, rpm: 2500, idlingTime: 120 },
          { date: '2023-02-08', temperature: 198.0, rpm: 3000, idlingTime: 90 },
          { date: '2023-02-15', temperature: 190.0, rpm: 1800, idlingTime: 180 },
        ]);
        
        setEmissionData([
          { date: '2023-02-01', co2: 120.5, nox: 0.08, pm: 0.005 },
          { date: '2023-02-08', co2: 135.0, nox: 0.09, pm: 0.006 },
          { date: '2023-02-15', co2: 110.0, nox: 0.07, pm: 0.004 },
        ]);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch vehicle data');
        setLoading(false);
        console.error(err);
      }
    };

    fetchVehicleData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${vehicle.make} ${vehicle.model}?`)) {
      try {
        await axios.delete(`/api/vehicles/${id}`);
        navigate('/vehicles');
      } catch (err) {
        console.error(`Error deleting vehicle ${id}:`, err);
        alert('Failed to delete vehicle. Please try again.');
      }
    }
  };

  // Chart options with dark mode support
  const chartOptions = {
    responsive: true,
    plugins: { 
      legend: { 
        position: 'top',
        labels: {
          color: isDark ? '#e5e7eb' : undefined,
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : undefined,
        titleColor: isDark ? '#e5e7eb' : undefined,
        bodyColor: isDark ? '#e5e7eb' : undefined,
        borderColor: isDark ? 'rgba(148, 163, 184, 0.2)' : undefined,
        borderWidth: isDark ? 1 : undefined,
      }
    },
    scales: {
      x: {
        ticks: {
          color: isDark ? '#e5e7eb' : undefined,
        },
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : undefined,
        }
      },
      y: {
        ticks: {
          color: isDark ? '#e5e7eb' : undefined,
        },
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : undefined,
        }
      }
    }
  };

  // Chart data for fuel efficiency
  const fuelChartData = {
    labels: fuelData.map(data => data.date),
    datasets: [
      {
        label: 'MPG',
        data: fuelData.map(data => data.mpg),
        borderColor: '#00BCD4',
        backgroundColor: 'rgba(0, 188, 212, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Chart data for engine temperature
  const engineTempChartData = {
    labels: engineData.map(data => data.date),
    datasets: [
      {
        label: 'Engine Temperature (°F)',
        data: engineData.map(data => data.temperature),
        borderColor: '#F44336',
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Chart data for emissions
  const emissionsChartData = {
    labels: emissionData.map(data => data.date),
    datasets: [
      {
        label: 'CO2 Emissions (g/km)',
        data: emissionData.map(data => data.co2),
        backgroundColor: '#1A237E',
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-primary">Loading vehicle data...</div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-red-600">{error || 'Vehicle not found'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button and actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link to="/vehicles" className="btn btn-secondary inline-flex items-center space-x-2">
            <ChevronLeft size={18} />
            <span>Back to Vehicles</span>
          </Link>
          <h1 className="text-3xl font-bold text-primary dark:text-primary-300">
            {vehicle.make} {vehicle.model}
          </h1>
        </div>
        <div className="flex space-x-2">
          <Link 
            to={`/vehicles/${vehicle.id}/edit`}
            className="btn btn-secondary inline-flex items-center space-x-2"
          >
            <Edit size={18} />
            <span>Edit</span>
          </Link>
          <button 
            className="btn bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 inline-flex items-center space-x-2"
            onClick={handleDelete}
          >
            <Trash2 size={18} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Vehicle Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-primary-100 dark:bg-primary-900 p-4 rounded-full">
              <Car size={32} className="text-primary dark:text-primary-300" />
            </div>
            <h2 className="text-2xl font-semibold dark:text-white">Vehicle Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Make</p>
              <p className="font-semibold dark:text-white">{vehicle.make}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Model</p>
              <p className="font-semibold dark:text-white">{vehicle.model}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Year</p>
              <p className="font-semibold dark:text-white">{vehicle.year}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">License Plate</p>
              <p className="font-semibold dark:text-white">{vehicle.licensePlate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Fuel Type</p>
              <p className="font-semibold dark:text-white">{vehicle.fuelType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Engine Size</p>
              <p className="font-semibold dark:text-white">{vehicle.engineSize || 'N/A'} L</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-primary-100 dark:bg-primary-900 p-4 rounded-full">
              <Fuel size={32} className="text-primary dark:text-primary-300" />
            </div>
            <h2 className="text-2xl font-semibold dark:text-white">Fuel Consumption</h2>
          </div>
          
          <div>
            <Line data={fuelChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-primary-100 dark:bg-primary-900 p-4 rounded-full">
              <Gauge size={32} className="text-primary dark:text-primary-300" />
            </div>
            <h2 className="text-2xl font-semibold dark:text-white">Engine Performance</h2>
          </div>
          
          <div>
            <Line data={engineTempChartData} options={chartOptions} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-primary-100 dark:bg-primary-900 p-4 rounded-full">
              <Wind size={32} className="text-primary dark:text-primary-300" />
            </div>
            <h2 className="text-2xl font-semibold dark:text-white">Emissions Data</h2>
          </div>
          
          <div>
            <Bar data={emissionsChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail; 