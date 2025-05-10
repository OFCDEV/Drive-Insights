import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Info } from 'lucide-react';
import axios from 'axios';

const AddEmissionRecord = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [vehicles, setVehicles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    vehicleId: '',
    date: new Date().toISOString().split('T')[0],
    co2: 120,
    nox: 0.08,
    pm: 0.005
  });

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
    
    return { demoVehicles };
  };

  // Fetch vehicles data
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        // Get demo vehicles
        const { demoVehicles } = generateDemoData();
        
        // Fetch real vehicles from API
        let realVehicles = [];
        try {
          const response = await axios.get('/api/vehicles');
          console.log("Vehicles API response:", response.data);
          
          realVehicles = response.data.map(vehicle => ({
            ...vehicle,
            isDemo: false
          }));
        } catch (apiErr) {
          console.error('Error fetching real vehicles:', apiErr);
          // Continue with demo data if API fails
        }
        
        // Combine real and demo vehicles
        const allVehicles = [...realVehicles, ...demoVehicles];
        setVehicles(allVehicles);
        
        // If we have a vehicleId from the previous page, set it
        const vehicleIdFromState = location.state?.vehicleId;
        if (vehicleIdFromState) {
          setFormData(prev => ({ ...prev, vehicleId: vehicleIdFromState }));
        } else if (allVehicles.length > 0) {
          // Otherwise select the first vehicle by default
          setFormData(prev => ({ ...prev, vehicleId: allVehicles[0].id }));
        }
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        setError("Failed to load vehicles. Please try again.");
      }
    };

    fetchVehicles();
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFeedback('');
    setDebugInfo(null);

    try {
      const selectedVehicle = vehicles.find(v => v.id.toString() === formData.vehicleId.toString());
      
      if (!selectedVehicle) {
        throw new Error('Please select a valid vehicle');
      }

      // Create a record object with all data
      const recordData = {
        vehicleId: formData.vehicleId,
        date: formData.date,
        co2: formData.co2,
        nox: formData.nox,
        pm: formData.pm
      };

      setDebugInfo({
        message: 'Submitting data',
        data: recordData,
        vehicle: selectedVehicle
      });

      // If it's a demo vehicle, handle differently
      if (selectedVehicle.isDemo) {
        // Store in localStorage for demo purposes
        const storageKey = 'demoEmissionRecords';
        const existingRecords = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const newRecord = {
          ...recordData,
          id: `demo-emission-${Date.now()}`,
          isDemo: true
        };
        
        existingRecords.push(newRecord);
        localStorage.setItem(storageKey, JSON.stringify(existingRecords));
        
        setFeedback('Demo emission record saved successfully!');
        setTimeout(() => {
          navigate('/emissions', { 
            state: { from: 'add-emission-record', vehicleId: formData.vehicleId }
          });
        }, 1500);
      } else {
        // For real vehicles, send data in the format expected by the backend
        try {
          const emissionData = {
            vehicleId: parseInt(formData.vehicleId),
            co2Emissions: parseFloat(formData.co2),
            noxEmissions: parseFloat(formData.nox),
            particulateMatter: parseFloat(formData.pm),
            recordingTime: new Date(formData.date).toISOString()
          };
          
          console.log("Sending emission data to API:", emissionData);
          const response = await axios.post('/api/emissions', emissionData);
          
          setDebugInfo({
            message: 'API Success',
            response: response.data
          });
          
          setFeedback('Emission record saved successfully!');
          setTimeout(() => {
            navigate('/emissions', { 
              state: { from: 'add-emission-record', vehicleId: formData.vehicleId } 
            });
          }, 1500);
        } catch (err) {
          console.error("Error saving emission record:", err);
          setError(err.message || "Failed to save emission record. Please try again.");
          setDebugInfo({
            error: err.message,
            response: err.response?.data
          });
        }
      }
    } catch (err) {
      console.error("Error saving emission record:", err);
      setError(err.message || "Failed to save emission record. Please try again.");
      setDebugInfo({
        error: err.message,
        response: err.response?.data
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Add Emission Record</h1>
          <p className="text-gray-600">
            Record emission data for your vehicle.
          </p>
        </div>
        <div>
          <Link 
            to="/emissions" 
            className="btn btn-ghost inline-flex items-center space-x-2"
          >
            <ChevronLeft size={18} />
            <span>Back to Emissions Data</span>
          </Link>
        </div>
      </div>

      {feedback && (
        <div className="alert alert-success">
          {feedback}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Vehicle</span>
            </label>
            <select
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
            >
              <option value="">Select a vehicle</option>
              {vehicles.length > 0 && (
                <>
                  {/* Real vehicles */}
                  {vehicles.filter(v => !v.isDemo).length > 0 && (
                    <optgroup label="Your Vehicles">
                      {vehicles.filter(v => !v.isDemo).map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  
                  {/* Demo vehicles */}
                  <optgroup label="Demo Vehicles">
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

          <div className="form-control">
            <label className="label">
              <span className="label-text">Date</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">CO2 Emissions (g/km)</span>
            </label>
            <input
              type="number"
              name="co2"
              value={formData.co2}
              onChange={handleNumberChange}
              className="input input-bordered w-full"
              min="0"
              step="0.1"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">NOx Emissions (g/km)</span>
            </label>
            <input
              type="number"
              name="nox"
              value={formData.nox}
              onChange={handleNumberChange}
              className="input input-bordered w-full"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Particulate Matter (g/km)</span>
            </label>
            <input
              type="number"
              name="pm"
              value={formData.pm}
              onChange={handleNumberChange}
              className="input input-bordered w-full"
              min="0"
              step="0.001"
              required
            />
          </div>

          <div className="text-center pt-4">
            <button
              type="submit"
              className="btn btn-primary w-full md:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Emission Record'}
            </button>
          </div>
        </form>
      </div>

      {debugInfo && (
        <div className="card bg-base-200">
          <div className="flex items-center mb-2">
            <Info size={18} className="mr-2 text-blue-500" />
            <h3 className="font-semibold">Debug Information</h3>
          </div>
          <pre className="text-xs overflow-auto bg-base-300 p-4 rounded">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AddEmissionRecord; 