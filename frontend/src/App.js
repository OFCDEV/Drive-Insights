import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import VehicleList from './pages/VehicleList';
import VehicleDetail from './pages/VehicleDetail';
import AddVehicle from './pages/AddVehicle';
import EditVehicle from './pages/EditVehicle';
import FuelConsumption from './pages/FuelConsumption';
import AddFuelRecord from './pages/AddFuelRecord';
import EngineMonitoring from './pages/EngineMonitoring';
import EmissionsData from './pages/EmissionsData';
import NotFound from './pages/NotFound';
import AddEngineRecord from './pages/AddEngineRecord';
import AddEmissionRecord from './pages/AddEmissionRecord';

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="vehicles" element={<VehicleList />} />
          <Route path="vehicles/new" element={<AddVehicle />} />
          <Route path="vehicles/:id" element={<VehicleDetail />} />
          <Route path="vehicles/:id/edit" element={<EditVehicle />} />
          <Route path="fuel-consumption" element={<FuelConsumption />} />
          <Route path="fuel-consumption/new" element={<AddFuelRecord />} />
          <Route path="engine-monitoring" element={<EngineMonitoring />} />
          <Route path="engine-monitoring/new" element={<AddEngineRecord />} />
          <Route path="emissions" element={<EmissionsData />} />
          <Route path="emissions/new" element={<AddEmissionRecord />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App; 