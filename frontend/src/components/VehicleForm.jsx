import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const VehicleForm = ({ vehicle, isEditing }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    year: vehicle?.year || new Date().getFullYear(),
    licensePlate: vehicle?.licensePlate || '',
    fuelType: vehicle?.fuelType || 'Gasoline',
    engineSize: vehicle?.engineSize || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'engineSize' ? 
        (value === '' ? '' : Number(value)) : 
        value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert empty string to null for engineSize
      const dataToSubmit = {
        ...formData,
        engineSize: formData.engineSize === '' ? null : formData.engineSize
      };

      if (isEditing) {
        await axios.put(`/api/vehicles/${vehicle.id}`, dataToSubmit);
      } else {
        await axios.post('/api/vehicles', dataToSubmit);
      }
      
      navigate('/vehicles');
    } catch (err) {
      console.error('Error saving vehicle:', err);
      setError(err.response?.data?.message || 'Failed to save vehicle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="make" className="block text-sm font-medium text-gray-700">
            Make *
          </label>
          <input
            type="text"
            id="make"
            name="make"
            required
            value={formData.make}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="model" className="block text-sm font-medium text-gray-700">
            Model *
          </label>
          <input
            type="text"
            id="model"
            name="model"
            required
            value={formData.model}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="year" className="block text-sm font-medium text-gray-700">
            Year *
          </label>
          <input
            type="number"
            id="year"
            name="year"
            min="1900"
            max={new Date().getFullYear() + 1}
            required
            value={formData.year}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700">
            License Plate *
          </label>
          <input
            type="text"
            id="licensePlate"
            name="licensePlate"
            required
            value={formData.licensePlate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700">
            Fuel Type
          </label>
          <select
            id="fuelType"
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="Gasoline">Gasoline</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
            <option value="CNG">CNG</option>
            <option value="LPG">LPG</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="engineSize" className="block text-sm font-medium text-gray-700">
            Engine Size (L)
          </label>
          <input
            type="number"
            id="engineSize"
            name="engineSize"
            step="0.1"
            min="0"
            value={formData.engineSize}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => navigate('/vehicles')}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEditing ? 'Update Vehicle' : 'Add Vehicle'}
        </button>
      </div>
    </form>
  );
};

export default VehicleForm; 