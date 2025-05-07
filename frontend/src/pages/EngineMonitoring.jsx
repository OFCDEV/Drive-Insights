import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Gauge, Thermometer, Clock, RotateCw, Download, Plus } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';

const EngineMonitoring = () => {
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get('vehicleId');
  
  const [vehicles, setVehicles] = useState([]);
  const [engineData, setEngineData] = useState([]);
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
        
        // Mock engine data
        const mockEngineData = [
          { id: 1, vehicleId: 1, date: '2023-02-01 08:30', temperature: 195.5, rpm: 2500, idlingTime: 120 },
          { id: 2, vehicleId: 1, date: '2023-02-01 12:45', temperature: 198.0, rpm: 3000, idlingTime: 90 },
          { id: 3, vehicleId: 1, date: '2023-02-01 17:15', temperature: 190.0, rpm: 1800, idlingTime: 180 },
          { id: 4, vehicleId: 2, date: '2023-02-02 09:20', temperature: 192.5, rpm: 2200, idlingTime: 150 },
          { id: 5, vehicleId: 2, date: '2023-02-02 13:30', temperature: 195.0, rpm: 2800, idlingTime: 110 },
          { id: 6, vehicleId: 2, date: '2023-02-02 18:10', temperature: 190.5, rpm: 1900, idlingTime: 200 },
          { id: 7, vehicleId: 3, date: '2023-02-03 10:15', temperature: 85.0, rpm: 0, idlingTime: 0 },
          { id: 8, vehicleId: 3, date: '2023-02-03 14:25', temperature: 87.5, rpm: 0, idlingTime: 0 },
          { id: 9, vehicleId: 3, date: '2023-02-03 19:05', temperature: 86.0, rpm: 0, idlingTime: 0 },
          { id: 10, vehicleId: 4, date: '2023-02-04 08:45', temperature: 210.5, rpm: 2100, idlingTime: 240 },
          { id: 11, vehicleId: 4, date: '2023-02-04 12:55', temperature: 215.0, rpm: 2600, idlingTime: 180 },
          { id: 12, vehicleId: 4, date: '2023-02-04 17:35', temperature: 208.0, rpm: 1700, idlingTime: 300 },
          { id: 13, vehicleId: 5, date: '2023-02-05 09:10', temperature: 188.5, rpm: 1800, idlingTime: 130 },
          { id: 14, vehicleId: 5, date: '2023-02-05 13:20', temperature: 192.0, rpm: 2300, idlingTime: 100 },
          { id: 15, vehicleId: 5, date: '2023-02-05 18:00', temperature: 186.0, rpm: 1600, idlingTime: 160 },
        ];
        
        setVehicles(mockVehicles);
        setEngineData(mockEngineData);
        
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

  // Filter engine data based on selected vehicle and date range
  const filteredEngineData = engineData.filter(data => {
    if (selectedVehicle && data.vehicleId !== selectedVehicle) {
      return false;
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

  // Calculate summary statistics
  const avgTemperature = filteredEngineData.length > 0 
    ? filteredEngineData.reduce((sum, data) => sum + data.temperature, 0) / filteredEngineData.length 
    : 0;
    
  const avgRpm = filteredEngineData.length > 0 
    ? filteredEngineData.reduce((sum, data) => sum + data.rpm, 0) / filteredEngineData.length 
    : 0;
    
  const totalIdlingTime = filteredEngineData.reduce((sum, data) => sum + data.idlingTime, 0);

  // Group data by vehicle for the idling time chart
  const idlingTimeByVehicle = vehicles.map(vehicle => {
    const vehicleData = filteredEngineData.filter(data => data.vehicleId === vehicle.id);
    const totalIdling = vehicleData.reduce((sum, data) => sum + data.idlingTime, 0);
    return {
      vehicle: `${vehicle.make} ${vehicle.model}`,
      idlingTime: totalIdling
    };
  }).filter(item => item.idlingTime > 0);

  // Chart data for temperature over time
  const temperatureChartData = {
    labels: filteredEngineData.map(data => data.date),
    datasets: [
      {
        label: 'Engine Temperature (°F)',
        data: filteredEngineData.map(data => data.temperature),
        borderColor: '#F44336',
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Chart data for RPM over time
  const rpmChartData = {
    labels: filteredEngineData.map(data => data.date),
    datasets: [
      {
        label: 'Engine RPM',
        data: filteredEngineData.map(data => data.rpm),
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
          <p className="text-gray-600">
            Track engine temperature, RPM, and idling time for your vehicles.
          </p>
        </div>
        <div className="flex space-x-2">
          <button className="btn btn-primary inline-flex items-center space-x-2">
            <Plus size={18} />
            <span>Add Engine Record</span>
          </button>
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
              <option value="last7">Last 7 Days</option>
              <option value="last30">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-white">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-3 rounded-full">
              <Thermometer size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Engine Temperature</p>
              <h3 className="text-2xl font-bold">{avgTemperature.toFixed(1)} °F</h3>
            </div>
          </div>
        </div>

        <div className="card bg-white">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-100 p-3 rounded-full">
              <RotateCw size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Engine RPM</p>
              <h3 className="text-2xl font-bold">{avgRpm.toFixed(0)}</h3>
            </div>
          </div>
        </div>

        <div className="card bg-white">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-100 p-3 rounded-full">
              <Clock size={24} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Idling Time</p>
              <h3 className="text-2xl font-bold">{totalIdlingTime} sec</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Engine Temperature</h3>
          <div className="h-64">
            <Line data={temperatureChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Engine RPM</h3>
          <div className="h-64">
            <Line data={rpmChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Idling Time by Vehicle</h3>
          <div className="h-64 flex justify-center">
            <Doughnut data={idlingChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Data Table */}
        <div className="card overflow-hidden">
          <h3 className="text-xl font-semibold mb-4">Recent Engine Data</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vehicle</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Temp (°F)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">RPM</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Idling (sec)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary">
                {filteredEngineData.slice(0, 5).map((record) => {
                  const vehicle = vehicles.find(v => v.id === record.vehicleId);
                  return (
                    <tr key={record.id} className="hover:bg-secondary-50">
                      <td className="px-4 py-3 text-sm">{record.date}</td>
                      <td className="px-4 py-3 text-sm">
                        {vehicle ? `${vehicle.make} ${vehicle.model}` : 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-sm">{record.temperature.toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm">{record.rpm}</td>
                      <td className="px-4 py-3 text-sm">{record.idlingTime}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngineMonitoring; 