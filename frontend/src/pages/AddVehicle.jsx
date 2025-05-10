import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import VehicleForm from '../components/VehicleForm';

const AddVehicle = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/vehicles" className="btn btn-secondary inline-flex items-center space-x-2">
          <ChevronLeft size={18} />
          <span>Back to Vehicles</span>
        </Link>
        <h1 className="text-3xl font-bold text-primary dark:text-primary-300">Add New Vehicle</h1>
      </div>
      
      <div className="card">
        <VehicleForm isEditing={false} />
      </div>
    </div>
  );
};

export default AddVehicle; 