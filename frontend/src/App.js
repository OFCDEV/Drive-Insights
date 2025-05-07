import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import VehicleList from './pages/VehicleList';
import VehicleDetail from './pages/VehicleDetail';
import AddVehicle from './pages/AddVehicle';
import EditVehicle from './pages/EditVehicle';
import FuelConsumption from './pages/FuelConsumption';
import EngineMonitoring from './pages/EngineMonitoring';
import EmissionsData from './pages/EmissionsData';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="vehicles" element={<VehicleList />} />
        <Route path="vehicles/new" element={<AddVehicle />} />
        <Route path="vehicles/:id" element={<VehicleDetail />} />
        <Route path="vehicles/:id/edit" element={<EditVehicle />} />
        <Route path="fuel-consumption" element={<FuelConsumption />} />
        <Route path="engine-monitoring" element={<EngineMonitoring />} />
        <Route path="emissions" element={<EmissionsData />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App; 