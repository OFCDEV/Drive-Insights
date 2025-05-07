import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft, Calendar, Filter, Download, Plus } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import axios from 'axios';

const FuelConsumption = () => {
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get('vehicleId');
  
  const [vehicles, setVehicles] = useState([]);
  const [fuelData, setFuelData] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleId ? parseInt(vehicleId) : null);
  const [dateRange, setDateRange] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real application, we would fetch actual data from the API
    // For now, we'll use mock data
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Mock vehicles data
        const mockVehicles = [
          { id: 1, make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'ABC123' },
          { id: 2, make: 'Honda', model: 'Civic', year: 2019, licensePlate: 'XYZ789' },
          { id: 3, make: 'Tesla', model: 'Model 3', year: 2021, licensePlate: 'EV1234' },
          { id: 4, make: 'Ford', model: 'F-150', year: 2018, licensePlate: 'TRK456' },
          { id: 5, make: 'Chevrolet', model: 'Volt', year: 2020, licensePlate: 'HYB789' },
        ];
        
        // Mock fuel consumption data
        const mockFuelData = [
          { id: 1, vehicleId: 1, date: '2023-01-15', amount: 12.5, distance: 350, mpg: 28.0, cost: 45.50 },
          { id: 2, vehicleId: 1, date: '2023-02-01', amount: 13.2, distance: 375, mpg: 28.4, cost: 48.75 },
          { id: 3, vehicleId: 1, date: '2023-02-15', amount: 12.8, distance: 360, mpg: 28.1, cost: 47.20 },
          { id: 4, vehicleId: 2, date: '2023-01-10', amount: 10.5, distance: 315, mpg: 30.0, cost: 38.85 },
          { id: 5, vehicleId: 2, date: '2023-01-25', amount: 11.0, distance: 335, mpg: 30.5, cost: 40.70 },
          { id: 6, vehicleId: 2, date: '2023-02-10', amount: 10.8, distance: 330, mpg: 30.6, cost: 39.95 },
          { id: 7, vehicleId: 4, date: '2023-01-05', amount: 18.5, distance: 370, mpg: 20.0, cost: 68.45 },
          { id: 8, vehicleId: 4, date: '2023-01-20', amount: 19.0, distance: 385, mpg: 20.3, cost: 70.30 },
          { id: 9, vehicleId: 4, date: '2023-02-05', amount: 18.8, distance: 375, mpg: 19.9, cost: 69.55 },
          { id: 10, vehicleId: 5, date: '2023-01-12', amount: 8.5, distance: 340, mpg: 40.0, cost: 31.45 },
          { id: 11, vehicleId: 5, date: '2023-01-28', amount: 8.2, distance: 330, mpg: 40.2, cost: 30.35 },
          { id: 12, vehicleId: 5, date: '2023-02-12', amount: 8.4, distance: 335, mpg: 39.9, cost: 31.10 },
        ];
        
        setVehicles(mockVehicles);
        setFuelData(mockFuelData);
        
        // If vehicleId is provided in URL but not set in state, set it
        if (vehicleId && !selectedVehicle) {
          setSelectedVehicle(parseInt(vehicleId));
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, [vehicleId, selectedVehicle]);

  // Filter fuel data based on selected vehicle and date range
  const filteredFuelData = fuelData.filter(data => {
    if (selectedVehicle && data.vehicleId !== selectedVehicle) {
      return false;
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

  // Calculate summary statistics
  const totalFuelAmount = filteredFuelData.reduce((sum, data) => sum + data.amount, 0);
  const totalDistance = filteredFuelData.reduce((sum, data) => sum + data.distance, 0);
  const totalCost = filteredFuelData.reduce((sum, data) => sum + data.cost, 0);
  const avgMpg = totalFuelAmount > 0 ? totalDistance / totalFuelAmount : 0;

  // Chart data for MPG over time
  const mpgChartData = {
    labels: filteredFuelData.map(data => data.date),
    datasets: [
      {
        label: 'MPG',
        data: filteredFuelData.map(data => data.mpg),
        borderColor: '#00BCD4',
        backgroundColor: 'rgba(0, 188, 212, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Chart data for fuel cost
  const costChartData = {
    labels: filteredFuelData.map(data => data.date),
    datasets: [
      {
        label: 'Fuel Cost ($)',
        data: filteredFuelData.map(data => data.cost),
        backgroundColor: '#1A237E',
      },
    ],
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
          <p className="text-gray-600">
            Track and analyze your vehicles' fuel efficiency and costs.
          </p>
        </div>
        <div className="flex space-x-2">
          <Link to="/fuel-consumption/new" className="btn btn-primary inline-flex items-center space-x-2">
            <Plus size={18} />
            <span>Add Fuel Record</span>
          </Link>
          <button className="btn btn-secondary inline-flex items-center space-x-2">
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={selectedVehicle || ''}
              onChange={(e) => setSelectedVehicle(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">All Vehicles</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
        <div className="card bg-white">
          <p className="text-sm text-gray-500">Total Distance</p>
          <h3 className="text-2xl font-bold">{totalDistance.toFixed(1)} mi</h3>
        </div>

        <div className="card bg-white">
          <p className="text-sm text-gray-500">Total Fuel Used</p>
          <h3 className="text-2xl font-bold">{totalFuelAmount.toFixed(1)} gal</h3>
        </div>

        <div className="card bg-white">
          <p className="text-sm text-gray-500">Average MPG</p>
          <h3 className="text-2xl font-bold">{avgMpg.toFixed(1)}</h3>
        </div>

        <div className="card bg-white">
          <p className="text-sm text-gray-500">Total Cost</p>
          <h3 className="text-2xl font-bold">${totalCost.toFixed(2)}</h3>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">MPG Over Time</h3>
          <div className="h-64">
            <Line data={mpgChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Fuel Cost</h3>
          <div className="h-64">
            <Bar data={costChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="card overflow-hidden">
        <h3 className="text-xl font-semibold mb-4">Fuel Records</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vehicle</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Distance</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fuel Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">MPG</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary">
              {filteredFuelData.length > 0 ? (
                filteredFuelData.map((record) => {
                  const vehicle = vehicles.find(v => v.id === record.vehicleId);
                  return (
                    <tr key={record.id} className="hover:bg-secondary-50">
                      <td className="px-4 py-3 text-sm">{record.date}</td>
                      <td className="px-4 py-3 text-sm">
                        {vehicle ? `${vehicle.make} ${vehicle.model}` : 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-sm">{record.distance} mi</td>
                      <td className="px-4 py-3 text-sm">{record.amount} gal</td>
                      <td className="px-4 py-3 text-sm">{record.mpg.toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm">${record.cost.toFixed(2)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
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