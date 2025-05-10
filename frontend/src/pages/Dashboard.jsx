import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Fuel, Gauge, Wind, TrendingUp, TrendingDown } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [apiVehicles, setApiVehicles] = useState([]);
  const [mockVehicles, setMockVehicles] = useState([]);
  const [fuelData, setFuelData] = useState([]);
  const [engineData, setEngineData] = useState([]);
  const [emissionData, setEmissionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMockData, setShowMockData] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Fetch API data whenever the component mounts
  useEffect(() => {
    const fetchApiData = async () => {
      try {
        const response = await axios.get('/api/vehicles');
        setApiVehicles(response.data);
      } catch (err) {
        console.warn('Failed to fetch vehicles from API:', err);
      }
    };

    fetchApiData();
  }, []);

  // Set up mock data once on component mount
  useEffect(() => {
    // Mock vehicle data
    const mockData = [
      { id: 'm1', make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'ABC123' },
      { id: 'm2', make: 'Honda', model: 'Civic', year: 2019, licensePlate: 'XYZ789' },
      { id: 'm3', make: 'Tesla', model: 'Model 3', year: 2021, licensePlate: 'EV1234' },
      { id: 'm4', make: 'Ford', model: 'F-150', year: 2018, licensePlate: 'TRK456' },
      { id: 'm5', make: 'Chevrolet', model: 'Volt', year: 2020, licensePlate: 'HYB789' },
    ];
    setMockVehicles(mockData);
    
    // Other mock data for fuel, engine, emissions
    setFuelData([
      { month: 'Jan', mpg: 28.0 },
      { month: 'Feb', mpg: 28.4 },
      { month: 'Mar', mpg: 27.8 },
      { month: 'Apr', mpg: 29.2 },
      { month: 'May', mpg: 28.7 },
      { month: 'Jun', mpg: 30.1 },
    ]);
    
    setEngineData([
      { vehicle: 'Toyota Camry', idlingTime: 120 },
      { vehicle: 'Honda Civic', idlingTime: 150 },
      { vehicle: 'Tesla Model 3', idlingTime: 0 },
      { vehicle: 'Ford F-150', idlingTime: 240 },
      { vehicle: 'Chevrolet Volt', idlingTime: 130 },
    ]);
    
    setEmissionData([
      { type: 'Toyota Camry', co2: 120.5 },
      { type: 'Honda Civic', co2: 115.5 },
      { type: 'Tesla Model 3', co2: 0 },
      { type: 'Ford F-150', co2: 180.5 },
      { type: 'Chevrolet Volt', co2: 85.5 },
    ]);
    
    setLoading(false);
  }, []);

  // Combine API and mock vehicles based on showMockData
  const allVehicles = showMockData 
    ? [...apiVehicles, ...mockVehicles]
    : apiVehicles;

  // Chart options with dark mode support
  const chartOptions = {
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    hover: {
      mode: 'nearest',
      intersect: true,
      animationDuration: 200
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
        beginAtZero: false,
        ticks: {
          color: isDark ? '#e5e7eb' : undefined,
        },
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : undefined,
        }
      }
    },
    plugins: {
      legend: {
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
    }
  };

  // Chart data for fuel efficiency with dark mode support
  const fuelChartData = {
    labels: fuelData.map(data => data.month),
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

  // Chart data for engine idling
  const engineChartData = {
    labels: engineData.map(data => data.vehicle),
    datasets: [
      {
        label: 'Idling Time (seconds)',
        data: engineData.map(data => data.idlingTime),
        backgroundColor: '#1A237E',
        hoverBackgroundColor: '#3949AB',
      },
    ],
  };

  // Chart data for emissions
  const emissionChartData = {
    labels: emissionData.map(data => data.type),
    datasets: [
      {
        label: 'CO2 Emissions',
        data: emissionData.map(data => data.co2),
        backgroundColor: [
          '#1A237E',
          '#3949AB',
          '#00BCD4',
          '#F44336',
          '#4CAF50',
        ],
        hoverOffset: 4,
      },
    ],
  };

  if (loading && apiVehicles.length === 0 && mockVehicles.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome to Drive Insights. View your vehicle performance at a glance.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-white dark:bg-gray-800 flex items-center space-x-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
          <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full transition-all duration-300 hover:bg-primary-200 dark:hover:bg-primary-800">
            <Car size={24} className="text-primary dark:text-primary-300" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Vehicles</p>
            <h3 className="text-2xl font-bold dark:text-white">{allVehicles.length}</h3>
            {showMockData && apiVehicles.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {apiVehicles.length} real, {mockVehicles.length} demo
              </p>
            )}
          </div>
        </div>

        <div className="card bg-white dark:bg-gray-800 flex items-center space-x-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
          <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full transition-all duration-300 hover:bg-primary-200 dark:hover:bg-primary-800">
            <Fuel size={24} className="text-primary dark:text-primary-300" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg. MPG</p>
            <h3 className="text-2xl font-bold dark:text-white">
              {(fuelData.reduce((sum, data) => sum + data.mpg, 0) / fuelData.length).toFixed(1)}
            </h3>
          </div>
        </div>

        <div className="card bg-white dark:bg-gray-800 flex items-center space-x-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
          <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full transition-all duration-300 hover:bg-primary-200 dark:hover:bg-primary-800">
            <Gauge size={24} className="text-primary dark:text-primary-300" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Idling Time</p>
            <h3 className="text-2xl font-bold dark:text-white">
              {engineData.reduce((sum, data) => sum + data.idlingTime, 0)} sec
            </h3>
          </div>
        </div>

        <div className="card bg-white dark:bg-gray-800 flex items-center space-x-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
          <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full transition-all duration-300 hover:bg-primary-200 dark:hover:bg-primary-800">
            <Wind size={24} className="text-primary dark:text-primary-300" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total CO2 Emissions</p>
            <h3 className="text-2xl font-bold dark:text-white">
              {emissionData.reduce((sum, data) => sum + data.co2, 0).toFixed(1)} g/km
            </h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
          <h3 className="text-xl font-semibold mb-4">Fuel Efficiency Over Time</h3>
          <div className="h-64">
            <Line data={fuelChartData} options={chartOptions} />
          </div>
        </div>

        <div className="card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
          <h3 className="text-xl font-semibold mb-4">Engine Idling Time by Vehicle</h3>
          <div className="h-64">
            <Bar data={engineChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
          <h3 className="text-xl font-semibold mb-4">CO2 Emissions by Vehicle</h3>
          <div className="h-64">
            <Doughnut data={emissionChartData} options={{
              maintainAspectRatio: false,
              animation: {
                duration: 1000,
                animateRotate: true,
                animateScale: true
              },
              hover: {
                animationDuration: 200
              },
              plugins: {
                legend: {
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
              }
            }} />
          </div>
        </div>

        <div className="card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
          <h3 className="text-xl font-semibold mb-4">Performance Indicators</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center space-x-3 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:shadow">
              <div className="text-green-600 dark:text-green-400">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-300">Fuel Economy</p>
                <p className="font-bold dark:text-white">Up 2.3% from last month</p>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center space-x-3 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:shadow">
              <div className="text-red-600 dark:text-red-400">
                <TrendingDown size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-300">Idling Time</p>
                <p className="font-bold dark:text-white">Down 1.8% from last month</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicles Section */}
      <div className="card transition-all duration-300 hover:shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h3 className="text-xl font-semibold">Your Vehicles</h3>
          <Link to="/vehicles" className="btn btn-primary btn-sm mt-2 md:mt-0 transition-all duration-300 hover:bg-primary-dark hover:shadow-md">
            View All Vehicles
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-secondary dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Make</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Model</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Year</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">License Plate</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary dark:divide-gray-600">
              {allVehicles.slice(0, 5).map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-secondary-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <td className="px-4 py-3 text-sm dark:text-gray-300">{vehicle.make}</td>
                  <td className="px-4 py-3 text-sm dark:text-gray-300">{vehicle.model}</td>
                  <td className="px-4 py-3 text-sm dark:text-gray-300">{vehicle.year}</td>
                  <td className="px-4 py-3 text-sm dark:text-gray-300">{vehicle.licensePlate}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    <Link 
                      to={`/vehicles/${vehicle.id}`} 
                      className="text-primary hover:text-primary-dark dark:text-primary-300 dark:hover:text-primary-200 transition-colors duration-200 hover:underline"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
          <h3 className="text-xl font-semibold mb-4">Fuel Consumption</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Track and monitor your vehicles' fuel efficiency and consumption patterns.</p>
          <Link 
            to="/fuel-consumption" 
            className="btn btn-primary w-full transition-all duration-300 hover:bg-primary-dark hover:shadow-md"
          >
            View Fuel Data
          </Link>
        </div>

        <div className="card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
          <h3 className="text-xl font-semibold mb-4">Engine Monitoring</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Monitor engine performance, temperature, RPM, and idling time.</p>
          <Link 
            to="/engine-monitoring" 
            className="btn btn-primary w-full transition-all duration-300 hover:bg-primary-dark hover:shadow-md"
          >
            View Engine Data
          </Link>
        </div>

        <div className="card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
          <h3 className="text-xl font-semibold mb-4">Emissions Data</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Track emissions data and monitor your vehicles' environmental impact.</p>
          <Link 
            to="/emissions" 
            className="btn btn-primary w-full transition-all duration-300 hover:bg-primary-dark hover:shadow-md"
          >
            View Emissions Data
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 