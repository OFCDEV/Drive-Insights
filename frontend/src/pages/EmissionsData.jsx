import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Wind, CloudRain, Download, Plus } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';

const EmissionsData = () => {
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get('vehicleId');
  
  const [vehicles, setVehicles] = useState([]);
  const [emissionData, setEmissionData] = useState([]);
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
        
        // Mock emission data
        const mockEmissionData = [
          { id: 1, vehicleId: 1, date: '2023-02-01', co2: 120.5, nox: 0.08, pm: 0.005 },
          { id: 2, vehicleId: 1, date: '2023-02-02', co2: 135.0, nox: 0.09, pm: 0.006 },
          { id: 3, vehicleId: 1, date: '2023-02-03', co2: 110.0, nox: 0.07, pm: 0.004 },
          { id: 4, vehicleId: 2, date: '2023-02-01', co2: 115.5, nox: 0.07, pm: 0.004 },
          { id: 5, vehicleId: 2, date: '2023-02-02', co2: 125.0, nox: 0.08, pm: 0.005 },
          { id: 6, vehicleId: 2, date: '2023-02-03', co2: 105.5, nox: 0.06, pm: 0.003 },
          { id: 7, vehicleId: 3, date: '2023-02-01', co2: 0.0, nox: 0.0, pm: 0.0 },
          { id: 8, vehicleId: 3, date: '2023-02-02', co2: 0.0, nox: 0.0, pm: 0.0 },
          { id: 9, vehicleId: 3, date: '2023-02-03', co2: 0.0, nox: 0.0, pm: 0.0 },
          { id: 10, vehicleId: 4, date: '2023-02-01', co2: 180.5, nox: 0.25, pm: 0.015 },
          { id: 11, vehicleId: 4, date: '2023-02-02', co2: 195.0, nox: 0.28, pm: 0.017 },
          { id: 12, vehicleId: 4, date: '2023-02-03', co2: 170.0, nox: 0.23, pm: 0.014 },
          { id: 13, vehicleId: 5, date: '2023-02-01', co2: 85.5, nox: 0.05, pm: 0.003 },
          { id: 14, vehicleId: 5, date: '2023-02-02', co2: 90.0, nox: 0.06, pm: 0.004 },
          { id: 15, vehicleId: 5, date: '2023-02-03', co2: 80.0, nox: 0.04, pm: 0.002 },
        ];
        
        setVehicles(mockVehicles);
        setEmissionData(mockEmissionData);
        
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

  // Filter emission data based on selected vehicle and date range
  const filteredEmissionData = emissionData.filter(data => {
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
  const avgCO2 = filteredEmissionData.length > 0 
    ? filteredEmissionData.reduce((sum, data) => sum + data.co2, 0) / filteredEmissionData.length 
    : 0;
    
  const avgNOx = filteredEmissionData.length > 0 
    ? filteredEmissionData.reduce((sum, data) => sum + data.nox, 0) / filteredEmissionData.length 
    : 0;
    
  const avgPM = filteredEmissionData.length > 0 
    ? filteredEmissionData.reduce((sum, data) => sum + data.pm, 0) / filteredEmissionData.length 
    : 0;

  // Group data by vehicle for the CO2 emissions chart
  const co2ByVehicle = vehicles.map(vehicle => {
    const vehicleData = filteredEmissionData.filter(data => data.vehicleId === vehicle.id);
    const avgCO2 = vehicleData.length > 0 
      ? vehicleData.reduce((sum, data) => sum + data.co2, 0) / vehicleData.length
      : 0;
    return {
      vehicle: `${vehicle.make} ${vehicle.model}`,
      co2: avgCO2
    };
  });

  // Chart data for CO2 emissions over time
  const co2ChartData = {
    labels: filteredEmissionData.map(data => data.date),
    datasets: [
      {
        label: 'CO2 Emissions (g/km)',
        data: filteredEmissionData.map(data => data.co2),
        borderColor: '#1A237E',
        backgroundColor: 'rgba(26, 35, 126, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Chart data for NOx emissions over time
  const noxChartData = {
    labels: filteredEmissionData.map(data => data.date),
    datasets: [
      {
        label: 'NOx Emissions (g/km)',
        data: filteredEmissionData.map(data => data.nox),
        borderColor: '#F44336',
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Chart data for CO2 emissions by vehicle
  const co2ByVehicleChartData = {
    labels: co2ByVehicle.map(data => data.vehicle),
    datasets: [
      {
        label: 'CO2 Emissions (g/km)',
        data: co2ByVehicle.map(data => data.co2),
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
        <div className="text-xl text-primary">Loading emissions data...</div>
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
          <h1 className="text-3xl font-bold text-primary mb-2">Emissions Data</h1>
          <p className="text-gray-600">
            Monitor and analyze your vehicles' environmental impact.
          </p>
        </div>
        <div className="flex space-x-2">
          <button className="btn btn-primary inline-flex items-center space-x-2">
            <Plus size={18} />
            <span>Add Emission Record</span>
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
            <div className="bg-primary-100 p-3 rounded-full">
              <Wind size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. CO2 Emissions</p>
              <h3 className="text-2xl font-bold">{avgCO2.toFixed(1)} g/km</h3>
            </div>
          </div>
        </div>

        <div className="card bg-white">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-3 rounded-full">
              <CloudRain size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. NOx Emissions</p>
              <h3 className="text-2xl font-bold">{avgNOx.toFixed(2)} g/km</h3>
            </div>
          </div>
        </div>

        <div className="card bg-white">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-100 p-3 rounded-full">
              <Wind size={24} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Particulate Matter</p>
              <h3 className="text-2xl font-bold">{avgPM.toFixed(3)} g/km</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">CO2 Emissions Over Time</h3>
          <div className="h-64">
            <Line data={co2ChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold mb-4">NOx Emissions Over Time</h3>
          <div className="h-64">
            <Line data={noxChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">CO2 Emissions by Vehicle</h3>
          <div className="h-64 flex justify-center">
            <Doughnut data={co2ByVehicleChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Data Table */}
        <div className="card overflow-hidden">
          <h3 className="text-xl font-semibold mb-4">Recent Emissions Data</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vehicle</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">CO2 (g/km)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">NOx (g/km)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">PM (g/km)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary">
                {filteredEmissionData.slice(0, 5).map((record) => {
                  const vehicle = vehicles.find(v => v.id === record.vehicleId);
                  return (
                    <tr key={record.id} className="hover:bg-secondary-50">
                      <td className="px-4 py-3 text-sm">{record.date}</td>
                      <td className="px-4 py-3 text-sm">
                        {vehicle ? `${vehicle.make} ${vehicle.model}` : 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-sm">{record.co2.toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm">{record.nox.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm">{record.pm.toFixed(3)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Environmental Impact Assessment */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Environmental Impact Assessment</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Carbon Footprint</h4>
            <p className="text-gray-600">
              The total CO2 emissions for the selected period is approximately 
              {' '}{filteredEmissionData.reduce((sum, data) => sum + data.co2, 0).toFixed(1)} grams per kilometer.
              {selectedVehicle && vehicles.find(v => v.id === selectedVehicle)?.make === 'Tesla' && 
                ' Electric vehicles like Tesla produce zero direct emissions, contributing to a cleaner environment.'}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Air Quality Impact</h4>
            <p className="text-gray-600">
              NOx emissions contribute to smog and acid rain. Your fleet's average NOx emission is
              {' '}{avgNOx.toFixed(2)} g/km, which is 
              {avgNOx < 0.08 ? ' below' : ' above'} the recommended level of 0.08 g/km.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Health Effects</h4>
            <p className="text-gray-600">
              Particulate matter can cause respiratory issues. Your fleet's average PM emission is
              {' '}{avgPM.toFixed(3)} g/km, which is 
              {avgPM < 0.005 ? ' within' : ' exceeding'} the safe threshold of 0.005 g/km.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmissionsData; 