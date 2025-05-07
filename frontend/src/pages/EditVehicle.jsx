import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import VehicleForm from '../components/VehicleForm';
import axios from 'axios';

const EditVehicle = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/vehicles/${id}`);
        setVehicle(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching vehicle:', err);
        setError('Failed to fetch vehicle details. Please try again.');
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-primary">Loading vehicle data...</div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-red-600">{error || 'Vehicle not found'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to={`/vehicles/${id}`} className="btn btn-secondary inline-flex items-center space-x-2">
          <ChevronLeft size={18} />
          <span>Back to Vehicle</span>
        </Link>
        <h1 className="text-3xl font-bold text-primary">
          Edit {vehicle.make} {vehicle.model}
        </h1>
      </div>
      
      <div className="card">
        <VehicleForm vehicle={vehicle} isEditing={true} />
      </div>
    </div>
  );
};

export default EditVehicle; 