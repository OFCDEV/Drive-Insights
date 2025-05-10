import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { Gauge, Thermometer, Clock, RotateCw, Download, Plus, RefreshCw } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { exportData } from '../utils/exportData';

const EngineMonitoring = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const vehicleId = searchParams.get('vehicleId');
  
  const [vehicles, setVehicles] = useState([]);
  const [engineData, setEngineData] = useState([]);
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
    
    // Default demo engine data
    let demoEngineData = [
      { id: 'demo-1', vehicleId: 'demo-1', date: '2023-02-01 08:30', temperature: 195.5, rpm: 2500, idlingTime: 120, isDemo: true },
      { id: 'demo-2', vehicleId: 'demo-1', date: '2023-02-01 12:45', temperature: 198.0, rpm: 3000, idlingTime: 90, isDemo: true },
      { id: 'demo-3', vehicleId: 'demo-1', date: '2023-02-01 17:15', temperature: 190.0, rpm: 1800, idlingTime: 180, isDemo: true },
      { id: 'demo-4', vehicleId: 'demo-2', date: '2023-02-02 09:20', temperature: 192.5, rpm: 2200, idlingTime: 150, isDemo: true },
      { id: 'demo-5', vehicleId: 'demo-2', date: '2023-02-02 13:30', temperature: 195.0, rpm: 2800, idlingTime: 110, isDemo: true },
      { id: 'demo-6', vehicleId: 'demo-2', date: '2023-02-02 18:10', temperature: 190.5, rpm: 1900, idlingTime: 200, isDemo: true },
      { id: 'demo-7', vehicleId: 'demo-3', date: '2023-02-03 10:15', temperature: 85.0, rpm: 0, idlingTime: 0, isDemo: true },
      { id: 'demo-8', vehicleId: 'demo-3', date: '2023-02-03 14:25', temperature: 87.5, rpm: 0, idlingTime: 0, isDemo: true },
      { id: 'demo-9', vehicleId: 'demo-3', date: '2023-02-03 19:05', temperature: 86.0, rpm: 0, idlingTime: 0, isDemo: true },
      { id: 'demo-10', vehicleId: 'demo-4', date: '2023-02-04 08:45', temperature: 210.5, rpm: 2100, idlingTime: 240, isDemo: true },
      { id: 'demo-11', vehicleId: 'demo-4', date: '2023-02-04 12:55', temperature: 215.0, rpm: 2600, idlingTime: 180, isDemo: true },
      { id: 'demo-12', vehicleId: 'demo-4', date: '2023-02-04 17:35', temperature: 208.0, rpm: 1700, idlingTime: 300, isDemo: true },
      { id: 'demo-13', vehicleId: 'demo-5', date: '2023-02-05 09:10', temperature: 188.5, rpm: 1800, idlingTime: 130, isDemo: true },
      { id: 'demo-14', vehicleId: 'demo-5', date: '2023-02-05 13:20', temperature: 192.0, rpm: 2300, idlingTime: 100, isDemo: true },
      { id: 'demo-15', vehicleId: 'demo-5', date: '2023-02-05 18:00', temperature: 186.0, rpm: 1600, idlingTime: 160, isDemo: true },
    ];
    
    // Try to load saved demo records from localStorage
    try {
      const savedDemoRecords = JSON.parse(localStorage.getItem('demoEngineRecords') || '[]');
      if (savedDemoRecords.length > 0) {
        // Combine default demo data with user-added demo records
        demoEngineData = [...demoEngineData, ...savedDemoRecords];
      }
    } catch (err) {
      console.error('Error loading demo records from localStorage:', err);
    }
    
    return { demoVehicles, demoEngineData };
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
        date: record.recordingTime || record.recordDate || record.date || record.record_date,
        temperature: record.engineTemperature || record.temperature || record.engine_temperature,
        rpm: record.engineRpm || record.rpm || record.engine_rpm,
        idlingTime: record.idlingTimeSeconds || record.idleTime || record.idlingTime || record.idle_time
      };
    });
  };

  // Function to fetch data (can be called when refreshing data)
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching engine monitoring data...");
      
      const { demoVehicles, demoEngineData } = generateDemoData();
      
      // Fetch real vehicle data
      let realVehicles = [];
      let realEngineData = [];
      
      try {
        // Always try to fetch real vehicles and engine data regardless of environment
        // Fetch real vehicles
        console.log("Fetching real vehicles...");
        const vehiclesResponse = await axios.get('/api/vehicles');
        console.log("Vehicles API response:", vehiclesResponse.data);
        
        realVehicles = vehiclesResponse.data.map(vehicle => ({
          ...vehicle,
          isDemo: false
        }));
        
        // Fetch real engine data
        console.log("Fetching real engine data...");
        const engineResponse = await axios.get('/api/engine-data');
        console.log("Engine data API response:", engineResponse.data);
        
        // Normalize the data to handle different API response formats
        realEngineData = normalizeApiData(engineResponse.data);
        
        console.log("Normalized real engine data:", realEngineData);
      } catch (apiErr) {
        console.error('Error fetching real data:', apiErr);
        // Continue with demo data if API fails
      }
      
      // Combine real and demo data
      setVehicles([...realVehicles, ...demoVehicles]);
      setEngineData([...realEngineData, ...demoEngineData]);
      
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

  // Refresh data when navigating back from adding a new engine record
  useEffect(() => {
    const fromAddPage = location.state?.from === 'add-engine-record';
    
    if (fromAddPage) {
      console.log("Returned from add engine record page - refreshing data");
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

  // Filter engine data based on selected vehicle and date range
  const filteredEngineData = engineData.filter(data => {
    // Skip records with missing required data
    if (!data.vehicleId || !data.temperature || !data.date) {
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
    
    if (dateRange === 'last7') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return new Date(data.date) >= sevenDaysAgo;
    }
    
    if (dateRange === 'last30') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(data.date) >= thirtyDaysAgo;
    }
    
    return true;
  });

  // Sort data by date for better visualization
  const sortedFilteredData = [...filteredEngineData].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  // Calculate summary statistics
  const avgTemperature = filteredEngineData.length > 0 
    ? filteredEngineData.reduce((sum, data) => {
        const temp = parseFloat(data.temperature || 0);
        return isNaN(temp) ? sum : sum + temp;
      }, 0) / filteredEngineData.length 
    : 0;
    
  const avgRpm = filteredEngineData.length > 0 
    ? filteredEngineData.reduce((sum, data) => {
        const rpm = parseFloat(data.rpm || 0);
        return isNaN(rpm) ? sum : sum + rpm;
      }, 0) / filteredEngineData.length 
    : 0;
    
  const totalIdlingTime = filteredEngineData.reduce((sum, data) => {
    const idling = parseFloat(data.idlingTime || 0);
    return isNaN(idling) ? sum : sum + idling;
  }, 0);

  // Group data by vehicle for the idling time chart
  const idlingTimeByVehicle = vehicles.map(vehicle => {
    const vehicleData = filteredEngineData.filter(data => data.vehicleId.toString() === vehicle.id.toString());
    const totalIdling = vehicleData.reduce((sum, data) => {
      const idling = parseFloat(data.idlingTime || 0);
      return isNaN(idling) ? sum : sum + idling;
    }, 0);
    return {
      vehicle: `${vehicle.make} ${vehicle.model}${vehicle.isDemo ? ' (Demo)' : ''}`,
      idlingTime: totalIdling
    };
  }).filter(item => item.idlingTime > 0);

  // Chart data for temperature over time
  const temperatureChartData = {
    labels: sortedFilteredData.map(data => {
      // Format date for display
      const date = new Date(data.date);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }),
    datasets: [
      {
        label: 'Engine Temperature (°F)',
        data: sortedFilteredData.map(data => parseFloat(data.temperature || 0)),
        borderColor: '#F44336',
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Chart data for RPM over time
  const rpmChartData = {
    labels: sortedFilteredData.map(data => {
      // Format date for display
      const date = new Date(data.date);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }),
    datasets: [
      {
        label: 'Engine RPM',
        data: sortedFilteredData.map(data => parseFloat(data.rpm || 0)),
        borderColor: '#1A237E',
        backgroundColor: 'rgba(26, 35, 126, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Chart data for idling time by vehicle
  const idlingChartData = {
    labels: idlingTimeByVehicle.map(data => data.vehicle),
    datasets: [
      {
        label: 'Idling Time (seconds)',
        data: idlingTimeByVehicle.map(data => data.idlingTime),
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
    exportData(filteredEngineData, 'engine', selectedVehicleObj);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-primary">Loading engine data...</div>
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
          <h1 className="text-3xl font-bold text-primary mb-2">Engine Monitoring</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track engine temperature, RPM, and idling time for your vehicles.
          </p>
        </div>
        <div className="flex space-x-2">
          <Link 
            to="/engine-monitoring/new" 
            className="btn btn-primary inline-flex items-center space-x-2"
            state={{ from: 'engine-monitoring' }}
          >
            <Plus size={18} />
            <span>Add Engine Record</span>
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
              <option value="last7">Last 7 Days</option>
              <option value="last30">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full transition-all duration-300 hover:bg-red-200 dark:hover:bg-red-800">
              <Thermometer size={24} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Engine Temperature</p>
              <h3 className="text-2xl font-bold dark:text-white">{avgTemperature.toFixed(1)} °F</h3>
            </div>
          </div>
        </div>

        <div className="card bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full transition-all duration-300 hover:bg-primary-200 dark:hover:bg-primary-800">
              <RotateCw size={24} className="text-primary dark:text-primary-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Engine RPM</p>
              <h3 className="text-2xl font-bold dark:text-white">{avgRpm.toFixed(0)}</h3>
            </div>
          </div>
        </div>

        <div className="card bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-full transition-all duration-300 hover:bg-amber-200 dark:hover:bg-amber-800">
              <Clock size={24} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Idling Time</p>
              <h3 className="text-2xl font-bold dark:text-white">{totalIdlingTime.toFixed(0)} sec</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
          <h3 className="text-xl font-semibold mb-4">Engine Temperature Over Time</h3>
          <div className="h-64">
            {sortedFilteredData.length > 0 ? (
              <Line data={temperatureChartData} options={chartOptions} />
            ) : (
              <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
                No data available for the selected filters
              </div>
            )}
          </div>
        </div>

        <div className="card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
          <h3 className="text-xl font-semibold mb-4">Engine RPM Over Time</h3>
          <div className="h-64">
            {sortedFilteredData.length > 0 ? (
              <Line data={rpmChartData} options={chartOptions} />
            ) : (
              <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
                No data available for the selected filters
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
        <h3 className="text-xl font-semibold mb-4">Idling Time by Vehicle</h3>
        <div className="h-64">
          {idlingTimeByVehicle.length > 0 ? (
            <Doughnut data={idlingChartData} options={{ 
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
          ) : (
            <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
              No idling data available for the selected filters
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="card overflow-hidden transition-all duration-300 hover:shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Engine Records</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-secondary dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Vehicle</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Temperature</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">RPM</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Idling Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary dark:divide-gray-600">
              {filteredEngineData.length > 0 ? (
                filteredEngineData.map((record) => {
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
                        {record.temperature ? parseFloat(record.temperature).toFixed(1) : '0'} °F
                      </td>
                      <td className="px-4 py-3 text-sm dark:text-gray-300">
                        {record.rpm ? parseFloat(record.rpm).toFixed(0) : '0'}
                      </td>
                      <td className="px-4 py-3 text-sm dark:text-gray-300">
                        {record.idlingTime ? parseFloat(record.idlingTime).toFixed(0) : '0'} sec
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    No engine records found.
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

export default EngineMonitoring; 