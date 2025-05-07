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

  // Chart data for fuel efficiency
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
          <p className="text-gray-600">
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
            <span className="ms-3 text-sm font-medium text-gray-700">Show Demo Data</span>
          </label>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-white flex items-center space-x-4">
          <div className="bg-primary-100 p-3 rounded-full">
            <Car size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Vehicles</p>
            <h3 className="text-2xl font-bold">{allVehicles.length}</h3>
            {showMockData && apiVehicles.length > 0 && (
              <p className="text-xs text-gray-500">
                {apiVehicles.length} real, {mockVehicles.length} demo
              </p>
            )}
          </div>
        </div>

        <div className="card bg-white flex items-center space-x-4">
          <div className="bg-primary-100 p-3 rounded-full">
            <Fuel size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Avg. MPG</p>
            <h3 className="text-2xl font-bold">
              {(fuelData.reduce((sum, data) => sum + data.mpg, 0) / fuelData.length).toFixed(1)}
            </h3>
          </div>
        </div>

        <div className="card bg-white flex items-center space-x-4">
          <div className="bg-primary-100 p-3 rounded-full">
            <Gauge size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Idling Time</p>
            <h3 className="text-2xl font-bold">
              {engineData.reduce((sum, data) => sum + data.idlingTime, 0)} sec
            </h3>
          </div>
        </div>

        <div className="card bg-white flex items-center space-x-4">
          <div className="bg-primary-100 p-3 rounded-full">
            <Wind size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total CO2 Emissions</p>
            <h3 className="text-2xl font-bold">
              {emissionData.reduce((sum, data) => sum + data.co2, 0).toFixed(1)} g/km
            </h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Fuel Efficiency Over Time</h3>
          <div className="h-64">
            <Line data={fuelChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Engine Idling Time by Vehicle</h3>
          <div className="h-64">
            <Bar data={engineChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">CO2 Emissions by Vehicle</h3>
          <div className="h-64 flex justify-center">
            <Doughnut data={emissionChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold mb-4">
            Recent Vehicles
            {apiVehicles.length > 0 && showMockData && (
              <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                {apiVehicles.length} real vehicle{apiVehicles.length !== 1 ? 's' : ''}
              </span>
            )}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Make</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Model</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Year</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">License</th>
                  {showMockData && <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Type</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary">
                {allVehicles.slice(0, 5).map((vehicle) => (
                  <tr key={vehicle.id} className={String(vehicle.id).startsWith('m') ? 'bg-blue-50' : ''}>
                    <td className="px-4 py-2 text-sm">{vehicle.make}</td>
                    <td className="px-4 py-2 text-sm">{vehicle.model}</td>
                    <td className="px-4 py-2 text-sm">{vehicle.year}</td>
                    <td className="px-4 py-2 text-sm">{vehicle.licensePlate}</td>
                    {showMockData && (
                      <td className="px-4 py-2 text-sm">
                        {String(vehicle.id).startsWith('m') ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Demo</span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Real</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {allVehicles.length === 0 && (
                  <tr>
                    <td colSpan={showMockData ? 5 : 4} className="px-4 py-6 text-center text-gray-500">
                      No vehicles found. Add a vehicle to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Link to="/vehicles" className="text-accent hover:text-accent-700 text-sm font-semibold">
              View all vehicles →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 