import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Calendar, Filter, Download, Plus, RefreshCw } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { exportData } from '../utils/exportData';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const FuelConsumption = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const vehicleId = searchParams.get('vehicleId');
  
  const [vehicles, setVehicles] = useState([]);
  const [fuelData, setFuelData] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleId ? parseInt(vehicleId) : null);
  const [dateRange, setDateRange] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // Used to force re-fetch data
  const [dataFetchTime, setDataFetchTime] = useState(new Date()); // Track when data was last fetched
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Check if we're in development environment
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Generate demo data for testing
  const generateDemoData = () => {
    // Demo vehicles data
    const demoVehicles = [
      { id: 'demo-1', make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'DEMO-123', isDemo: true },
      { id: 'demo-2', make: 'Honda', model: 'Civic', year: 2019, licensePlate: 'DEMO-456', isDemo: true },
      { id: 'demo-3', make: 'Tesla', model: 'Model 3', year: 2021, licensePlate: 'EV1234', isDemo: true },
      { id: 'demo-4', make: 'Ford', model: 'F-150', year: 2018, licensePlate: 'TRK456', isDemo: true },
      { id: 'demo-5', make: 'Chevrolet', model: 'Volt', year: 2020, licensePlate: 'HYB789', isDemo: true },
    ];
    
    // Default demo fuel consumption data
    let demoFuelData = [
      { id: 'demo-1', vehicleId: 'demo-1', date: '2023-01-15', amount: 12.5, distance: 350, mpg: 28.0, cost: 45.50, isDemo: true },
      { id: 'demo-2', vehicleId: 'demo-1', date: '2023-02-01', amount: 13.2, distance: 375, mpg: 28.4, cost: 48.75, isDemo: true },
      { id: 'demo-3', vehicleId: 'demo-1', date: '2023-02-15', amount: 12.8, distance: 360, mpg: 28.1, cost: 47.20, isDemo: true },
      { id: 'demo-4', vehicleId: 'demo-2', date: '2023-01-10', amount: 10.5, distance: 315, mpg: 30.0, cost: 38.85, isDemo: true },
      { id: 'demo-5', vehicleId: 'demo-2', date: '2023-01-25', amount: 11.0, distance: 335, mpg: 30.5, cost: 40.70, isDemo: true },
      { id: 'demo-6', vehicleId: 'demo-2', date: '2023-02-10', amount: 10.8, distance: 330, mpg: 30.6, cost: 39.95, isDemo: true },
      { id: 'demo-7', vehicleId: 'demo-4', date: '2023-01-05', amount: 18.5, distance: 370, mpg: 20.0, cost: 68.45, isDemo: true },
      { id: 'demo-8', vehicleId: 'demo-4', date: '2023-01-20', amount: 19.0, distance: 385, mpg: 20.3, cost: 70.30, isDemo: true },
      { id: 'demo-9', vehicleId: 'demo-4', date: '2023-02-05', amount: 18.8, distance: 375, mpg: 19.9, cost: 69.55, isDemo: true },
      { id: 'demo-10', vehicleId: 'demo-5', date: '2023-01-12', amount: 8.5, distance: 340, mpg: 40.0, cost: 31.45, isDemo: true },
      { id: 'demo-11', vehicleId: 'demo-5', date: '2023-01-28', amount: 8.2, distance: 330, mpg: 40.2, cost: 30.35, isDemo: true },
      { id: 'demo-12', vehicleId: 'demo-5', date: '2023-02-12', amount: 8.4, distance: 335, mpg: 39.9, cost: 31.10, isDemo: true },
    ];
    
    // Try to load saved demo records from localStorage
    try {
      const savedDemoRecords = JSON.parse(localStorage.getItem('demoFuelRecords') || '[]');
      if (savedDemoRecords.length > 0) {
        // Combine default demo data with user-added demo records
        demoFuelData = [...demoFuelData, ...savedDemoRecords];
      }
    } catch (err) {
      console.error('Error loading demo records from localStorage:', err);
    }
    
    return { demoVehicles, demoFuelData };
  };

  // Function to normalize API data to a consistent format
  const normalizeApiData = (data) => {
    if (!data) return [];
    
    // Handle array or object responses
    const dataArray = Array.isArray(data) ? data : [data];
    
    return dataArray.map(record => {
      // Create a normalized record with all possible field names
      return {
        ...record,
        isDemo: false,
        // Ensure consistent property names regardless of API response format
        id: record.id || record._id,
        vehicleId: record.vehicleId || 
                   (record.vehicle ? record.vehicle.id : null) || 
                   record.vehicle_id,
        date: record.fillDate || record.date || record.fill_date,
        amount: record.fuelAmount || record.amount || record.fuel_amount,
        distance: record.distanceTraveled || record.distance || record.distance_traveled,
        mpg: record.milesPerGallon || record.mpg || record.miles_per_gallon,
        cost: record.fuelCost || record.cost || record.fuel_cost
      };
    });
  };

  // Function to fetch data (can be called when refreshing data)
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching fuel consumption data...");
      
      const { demoVehicles, demoFuelData } = generateDemoData();
      
      // Fetch real vehicle data
      let realVehicles = [];
      let realFuelData = [];
      
      try {
        // Always try to fetch real vehicles and fuel data regardless of environment
        // Fetch real vehicles
        console.log("Fetching real vehicles...");
        const vehiclesResponse = await axios.get('/api/vehicles');
        console.log("Vehicles API response:", vehiclesResponse.data);
        
        realVehicles = vehiclesResponse.data.map(vehicle => ({
          ...vehicle,
          isDemo: false
        }));
        
        // Fetch real fuel consumption data
        console.log("Fetching real fuel consumption data...");
        const fuelResponse = await axios.get('/api/fuel-consumption');
        console.log("Fuel consumption API response:", fuelResponse.data);
        
        // Normalize the data to handle different API response formats
        realFuelData = normalizeApiData(fuelResponse.data);
        
        console.log("Normalized real fuel data:", realFuelData);
      } catch (apiErr) {
        console.error('Error fetching real data:', apiErr);
        // Continue with demo data if API fails
      }
      
      // Combine real and demo data
      setVehicles([...realVehicles, ...demoVehicles]);
      setFuelData([...realFuelData, ...demoFuelData]);
      
      // If vehicleId is provided in URL but not set in state, set it
      if (vehicleId && !selectedVehicle) {
        setSelectedVehicle(vehicleId.toString().startsWith('demo-') ? vehicleId : parseInt(vehicleId));
      }
      
      // Update data fetch time
      setDataFetchTime(new Date());
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch data');
      setLoading(false);
      console.error(err);
    }
  }, [vehicleId, selectedVehicle]);

  // Fetch data on component mount or when refreshKey changes
  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  // Refresh data when navigating back from adding a new fuel record
  useEffect(() => {
    const fromAddPage = location.state?.from === 'add-fuel-record';
    
    if (fromAddPage) {
      console.log("Returned from add fuel record page - refreshing data");
      // Force refresh data when coming back from add page
      setRefreshKey(prevKey => prevKey + 1);
      
      // If a specific vehicle was selected in the form, select it here as well
      const newVehicleId = location.state?.vehicleId;
      if (newVehicleId) {
        setSelectedVehicle(newVehicleId.toString().startsWith('demo-') ? newVehicleId : parseInt(newVehicleId));
      }
    }
  }, [location]);

  // Auto-refresh every 30 seconds if data is stale
  useEffect(() => {
    const autoRefreshInterval = setInterval(() => {
      const now = new Date();
      const dataAge = now - dataFetchTime;
      
      // If data is older than 30 seconds, refresh it
      if (dataAge > 30000) {
        console.log("Auto-refreshing stale data");
        setRefreshKey(prevKey => prevKey + 1);
      }
    }, 30000);
    
    return () => clearInterval(autoRefreshInterval);
  }, [dataFetchTime]);

  // Handle refresh button click
  const handleRefresh = () => {
    console.log("Manual refresh triggered");
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Filter fuel data based on selected vehicle and date range
  const filteredFuelData = fuelData.filter(data => {
    // Skip records with missing required data
    if (!data.vehicleId || !data.amount || !data.distance || !data.date) {
      console.log("Filtering out incomplete record:", data);
      return false;
    }
    
    // For vehicle filtering, handle both number and string IDs (for demo data)
    if (selectedVehicle) {
      const selectedId = selectedVehicle.toString();
      const dataId = data.vehicleId.toString();
      if (selectedId !== dataId) {
        return false;
      }
    }
    
    if (dateRange === 'last30') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(data.date) >= thirtyDaysAgo;
    }
    
    if (dateRange === 'last90') {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      return new Date(data.date) >= ninetyDaysAgo;
    }
    
    return true;
  });

  // Sort data by date for better visualization
  const sortedFilteredData = [...filteredFuelData].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  // Calculate summary statistics
  const totalFuelAmount = filteredFuelData.reduce((sum, data) => {
    const amount = parseFloat(data.amount || 0);
    return isNaN(amount) ? sum : sum + amount;
  }, 0);
  
  const totalDistance = filteredFuelData.reduce((sum, data) => {
    const distance = parseFloat(data.distance || 0);
    return isNaN(distance) ? sum : sum + distance;
  }, 0);
  
  const totalCost = filteredFuelData.reduce((sum, data) => {
    const cost = parseFloat(data.cost || 0);
    return isNaN(cost) ? sum : sum + cost;
  }, 0);
  
  const avgMpg = totalFuelAmount > 0 ? totalDistance / totalFuelAmount : 0;

  // Chart data for MPG over time
  const mpgChartData = {
    labels: sortedFilteredData.map(data => {
      // Format date for display
      const date = new Date(data.date);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }),
    datasets: [
      {
        label: 'MPG',
        data: sortedFilteredData.map(data => parseFloat(data.mpg || 0)),
        borderColor: '#00BCD4',
        backgroundColor: 'rgba(0, 188, 212, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Chart data for fuel cost
  const costChartData = {
    labels: sortedFilteredData.map(data => {
      // Format date for display
      const date = new Date(data.date);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }),
    datasets: [
      {
        label: 'Fuel Cost ($)',
        data: sortedFilteredData.map(data => parseFloat(data.cost || 0)),
        backgroundColor: '#1A237E',
      },
    ],
  };

  // Chart options with dark mode support
  const chartOptions = {
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
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

  const handleExport = () => {
    const selectedVehicleObj = selectedVehicle ? 
      vehicles.find(v => v.id.toString() === selectedVehicle.toString()) : null;
    exportData(filteredFuelData, 'fuel', selectedVehicleObj);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-primary">Loading fuel consumption data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Fuel Consumption</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track and analyze your vehicles' fuel efficiency and costs.
          </p>
        </div>
        <div className="flex space-x-2">
          <Link 
            to="/fuel-consumption/new" 
            className="btn btn-primary inline-flex items-center space-x-2"
            state={{ from: 'fuel-consumption' }}
          >
            <Plus size={18} />
            <span>Add Fuel Record</span>
          </Link>
          <button 
            className="btn btn-secondary inline-flex items-center space-x-2"
            onClick={handleRefresh}
          >
            <RefreshCw size={18} />
            <span>Refresh</span>
          </button>
          <button 
            className="btn btn-secondary inline-flex items-center space-x-2"
            onClick={handleExport}
          >
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Last update time */}
      <div className="text-xs text-gray-500 dark:text-gray-400 italic">
        Last updated: {dataFetchTime.toLocaleTimeString()}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={selectedVehicle || ''}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedVehicle(value ? (value.startsWith('demo-') ? value : parseInt(value)) : null);
              }}
            >
              <option value="">All Vehicles</option>
              {vehicles.length > 0 && (
                <>
                  {/* Real vehicles */}
                  {vehicles.filter(v => !v.isDemo).length > 0 && (
                    <optgroup label="Your Vehicles" className="dark:text-gray-200">
                      {vehicles.filter(v => !v.isDemo).map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  
                  {/* Demo vehicles */}
                  <optgroup label="Demo Vehicles" className="dark:text-gray-200">
                    {vehicles.filter(v => v.isDemo).map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                      </option>
                    ))}
                  </optgroup>
                </>
              )}
            </select>
          </div>
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Range</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="last30">Last 30 Days</option>
              <option value="last90">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Distance</p>
          <h3 className="text-2xl font-bold dark:text-white">{totalDistance.toFixed(1)} mi</h3>
        </div>

        <div className="card bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Fuel Used</p>
          <h3 className="text-2xl font-bold dark:text-white">{totalFuelAmount.toFixed(1)} gal</h3>
        </div>

        <div className="card bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
          <p className="text-sm text-gray-500 dark:text-gray-400">Average MPG</p>
          <h3 className="text-2xl font-bold dark:text-white">{avgMpg.toFixed(1)}</h3>
        </div>

        <div className="card bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Cost</p>
          <h3 className="text-2xl font-bold dark:text-white">${totalCost.toFixed(2)}</h3>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
          <h3 className="text-xl font-semibold mb-4">MPG Over Time</h3>
          <div className="h-64">
            {sortedFilteredData.length > 0 ? (
              <Line data={mpgChartData} options={chartOptions} />
            ) : (
              <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
                No data available for the selected filters
              </div>
            )}
          </div>
        </div>

        <div className="card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
          <h3 className="text-xl font-semibold mb-4">Fuel Cost</h3>
          <div className="h-64">
            {sortedFilteredData.length > 0 ? (
              <Bar data={costChartData} options={chartOptions} />
            ) : (
              <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
                No data available for the selected filters
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="card overflow-hidden transition-all duration-300 hover:shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Fuel Records</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-secondary dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Vehicle</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Distance</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Fuel Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">MPG</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary dark:divide-gray-600">
              {filteredFuelData.length > 0 ? (
                filteredFuelData.map((record) => {
                  const vehicle = vehicles.find(v => v.id.toString() === record.vehicleId?.toString());
                  // Format date for display
                  let formattedDate = record.date;
                  try {
                    if (record.date) {
                      const date = new Date(record.date);
                      if (!isNaN(date)) {
                        formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
                      }
                    }
                  } catch (e) {
                    console.error("Error formatting date:", e);
                  }
                  
                  return (
                    <tr key={record.id} className="hover:bg-secondary-50 dark:hover:bg-gray-700 transition-colors duration-200">
                      <td className="px-4 py-3 text-sm dark:text-gray-300">{formattedDate}</td>
                      <td className="px-4 py-3 text-sm dark:text-gray-300">
                        {vehicle ? `${vehicle.make} ${vehicle.model}${record.isDemo ? ' (Demo)' : ''}` : 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-sm dark:text-gray-300">
                        {record.distance ? parseFloat(record.distance).toFixed(1) : '0'} mi
                      </td>
                      <td className="px-4 py-3 text-sm dark:text-gray-300">
                        {record.amount ? parseFloat(record.amount).toFixed(1) : '0'} gal
                      </td>
                      <td className="px-4 py-3 text-sm dark:text-gray-300">
                        {record.mpg ? parseFloat(record.mpg).toFixed(1) : '0'}
                      </td>
                      <td className="px-4 py-3 text-sm dark:text-gray-300">
                        ${record.cost ? parseFloat(record.cost).toFixed(2) : '0.00'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    No fuel consumption records found.
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

export default FuelConsumption; 