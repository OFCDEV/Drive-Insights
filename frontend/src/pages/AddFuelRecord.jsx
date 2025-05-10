import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import axios from 'axios';

const AddFuelRecord = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiDebug, setApiDebug] = useState(null); // For debugging API responses
  const [formData, setFormData] = useState({
    vehicleId: '',
    fuelAmount: '10.5',  // Default values for easier testing
    distanceTraveled: '250',
    milesPerGallon: '23.8',
    fuelCost: '38.50',
    fillDate: new Date().toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = useState(false);

  // Check if we're in development environment for mock API
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        
        // Demo vehicles data
        const demoVehicles = [
          { id: 'demo-1', make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'DEMO-123', isDemo: true },
          { id: 'demo-2', make: 'Honda', model: 'Civic', year: 2019, licensePlate: 'DEMO-456', isDemo: true },
          { id: 'demo-3', make: 'Tesla', model: 'Model 3', year: 2021, licensePlate: 'EV1234', isDemo: true },
          { id: 'demo-4', make: 'Ford', model: 'F-150', year: 2018, licensePlate: 'TRK456', isDemo: true },
          { id: 'demo-5', make: 'Chevrolet', model: 'Volt', year: 2020, licensePlate: 'HYB789', isDemo: true },
        ];
        
        // Fetch real vehicle data from the API
        let realVehicles = [];
        try {
          // Always try to fetch real vehicles regardless of environment
          const response = await axios.get('/api/vehicles');
          console.log('API response for vehicles:', response.data);
          realVehicles = response.data.map(vehicle => ({
            ...vehicle,
            isDemo: false
          }));
        } catch (apiErr) {
          console.error('Error fetching real vehicles:', apiErr);
          // Continue with demo data if API fails
        }
        
        // Combine real and demo vehicles
        setVehicles([...realVehicles, ...demoVehicles]);
        
        // If there are any vehicles, pre-select the first one
        if ([...realVehicles, ...demoVehicles].length > 0) {
          setFormData(prev => ({
            ...prev,
            vehicleId: [...realVehicles, ...demoVehicles][0].id.toString()
          }));
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error in vehicle setup:', err);
        setError('Failed to load vehicles. Please try again later.');
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Calculate MPG automatically if both fuel amount and distance are provided
    if ((name === 'fuelAmount' || name === 'distanceTraveled') && 
        formData.fuelAmount && formData.distanceTraveled) {
      const fuelAmount = name === 'fuelAmount' ? parseFloat(value) : parseFloat(formData.fuelAmount);
      const distance = name === 'distanceTraveled' ? parseFloat(value) : parseFloat(formData.distanceTraveled);
      
      if (fuelAmount > 0 && distance > 0) {
        const mpg = distance / fuelAmount;
        setFormData({
          ...formData,
          [name]: value,
          milesPerGallon: mpg.toFixed(2)
        });
        return;
      }
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.vehicleId || !formData.fuelAmount || !formData.distanceTraveled || !formData.fillDate) {
      setError('Please fill in all required fields.');
      return;
    }
    
    // Clear previous errors and debug info
    setError(null);
    setApiDebug(null);
    
    try {
      setSubmitting(true);
      
      const selectedVehicle = vehicles.find(v => v.id.toString() === formData.vehicleId.toString());
      const isDemo = selectedVehicle && selectedVehicle.isDemo;
      
      // For demo vehicles
      if (isDemo) {
        // Prepare the data payload for demo
        const fuelRecord = {
          vehicleId: formData.vehicleId,
          fuelAmount: parseFloat(formData.fuelAmount),
          distanceTraveled: parseFloat(formData.distanceTraveled),
          milesPerGallon: parseFloat(formData.milesPerGallon || 0),
          fuelCost: parseFloat(formData.fuelCost || 0),
          fillDate: formData.fillDate
        };
        
        // Debug log
        console.log('Submitting demo fuel record:', fuelRecord);
        
        // For demo vehicles, simulate a successful save
        console.log('Saving demo fuel record:', fuelRecord);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create a mock entry for demo to include in state
        const timestamp = new Date().getTime();
        const newDemoRecord = {
          ...fuelRecord,
          id: `demo-${timestamp}`,
          isDemo: true,
          date: fuelRecord.fillDate, // Ensure consistent property name
          amount: fuelRecord.fuelAmount, // Ensure consistent property name
          distance: fuelRecord.distanceTraveled, // Ensure consistent property name
          mpg: fuelRecord.milesPerGallon, // Ensure consistent property name
          cost: fuelRecord.fuelCost // Ensure consistent property name
        };
        
        // Store the new record in localStorage to persist it
        try {
          const existingRecords = JSON.parse(localStorage.getItem('demoFuelRecords') || '[]');
          existingRecords.push(newDemoRecord);
          localStorage.setItem('demoFuelRecords', JSON.stringify(existingRecords));
        } catch (storageError) {
          console.error('Failed to save demo record to localStorage:', storageError);
        }
        
        // Navigate back with success
        setSubmitting(false);
        navigate('/fuel-consumption', { 
          state: { 
            from: 'add-fuel-record',
            newRecord: true,
            vehicleId: formData.vehicleId
          } 
        });
      } else {
        // For real vehicles, submit to the API
        // Try multiple formats to handle potential API differences
        let successfulFormat = null;
        let lastError = null;
        
        // Formats to try (in order)
        const formats = [
          // Format 1: Java/Spring boot style with vehicle object reference
          {
            vehicle: { id: parseInt(formData.vehicleId) },
            fuelAmount: parseFloat(formData.fuelAmount),
            distanceTraveled: parseFloat(formData.distanceTraveled),
            milesPerGallon: parseFloat(formData.milesPerGallon || 0),
            fuelCost: parseFloat(formData.fuelCost || 0),
            fillDate: formData.fillDate
          },
          
          // Format 2: With snake_case fields
          {
            vehicle_id: parseInt(formData.vehicleId),
            fuel_amount: parseFloat(formData.fuelAmount),
            distance_traveled: parseFloat(formData.distanceTraveled),
            miles_per_gallon: parseFloat(formData.milesPerGallon || 0),
            fuel_cost: parseFloat(formData.fuelCost || 0),
            fill_date: formData.fillDate
          },
          
          // Format 3: Direct camelCase with vehicleId
          {
            vehicleId: parseInt(formData.vehicleId),
            fuelAmount: parseFloat(formData.fuelAmount),
            distanceTraveled: parseFloat(formData.distanceTraveled),
            milesPerGallon: parseFloat(formData.milesPerGallon || 0),
            fuelCost: parseFloat(formData.fuelCost || 0),
            fillDate: formData.fillDate
          },
          
          // Format 4: With different date format (ISO string)
          {
            vehicleId: parseInt(formData.vehicleId),
            fuelAmount: parseFloat(formData.fuelAmount),
            distanceTraveled: parseFloat(formData.distanceTraveled),
            milesPerGallon: parseFloat(formData.milesPerGallon || 0),
            fuelCost: parseFloat(formData.fuelCost || 0),
            fillDate: new Date(formData.fillDate).toISOString()
          }
        ];
        
        // Try each format until one works
        for (const format of formats) {
          try {
            console.log('Trying API format:', format);
            setApiDebug(JSON.stringify({
              attemptingFormat: format
            }, null, 2));
            
            const response = await axios.post('/api/fuel-consumption', format);
            console.log('API response:', response);
            successfulFormat = format;
            break; // Exit loop if successful
          } catch (formatError) {
            console.log('Format failed:', formatError);
            lastError = formatError;
            // Continue to next format
          }
        }
        
        if (successfulFormat) {
          // Success! Navigate back
          setSubmitting(false);
          navigate('/fuel-consumption', { 
            state: { 
              from: 'add-fuel-record',
              newRecord: true,
              vehicleId: formData.vehicleId
            } 
          });
        } else {
          // All formats failed, handle the error
          setSubmitting(false);
          
          if (lastError?.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const statusCode = lastError.response.status;
            const responseData = lastError.response.data;
            
            // Add detailed debug info
            setApiDebug(JSON.stringify({
              triedFormats: formats,
              error: {
                status: statusCode,
                data: responseData
              }
            }, null, 2));
            
            if (statusCode === 400) {
              throw new Error(`Invalid data: ${responseData.message || responseData.error || 'Please check your input'}`);
            } else if (statusCode === 401 || statusCode === 403) {
              throw new Error('You are not authorized to perform this action');
            } else {
              throw new Error(`Server error (${statusCode}): ${responseData.message || responseData.error || 'Please try again later'}`);
            }
          } else if (lastError?.request) {
            // The request was made but no response was received
            setApiDebug('No response received from server. Request object: ' + JSON.stringify(lastError.request, null, 2));
            throw new Error('No response from server. Please check your network connection and try again.');
          } else {
            // Something happened in setting up the request that triggered an Error
            setApiDebug('Request setup error: ' + (lastError?.message || 'Unknown error'));
            throw new Error(`Request error: ${lastError?.message || 'Unknown error'}`);
          }
        }
      }
    } catch (err) {
      console.error('Error saving fuel record:', err);
      setError(err.message || 'Failed to save fuel record. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-primary">Loading vehicles...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/fuel-consumption" className="btn btn-circle btn-ghost">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-3xl font-bold text-primary">Add Fuel Record</h1>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {apiDebug && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 overflow-auto max-h-40">
          <p className="font-bold">API Debug Info</p>
          <pre className="text-xs whitespace-pre-wrap">{apiDebug}</pre>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle <span className="text-red-500">*</span>
              </label>
              <select
                id="vehicleId"
                name="vehicleId"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={formData.vehicleId}
                onChange={handleChange}
                required
              >
                <option value="">Select a vehicle</option>
                {vehicles.length > 0 && (
                  <>
                    {/* Real vehicles */}
                    {vehicles.filter(v => !v.isDemo).length > 0 && (
                      <>
                        <optgroup label="Your Vehicles">
                          {vehicles.filter(v => !v.isDemo).map((vehicle) => (
                            <option key={vehicle.id} value={vehicle.id}>
                              {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                            </option>
                          ))}
                        </optgroup>
                      </>
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

            <div>
              <label htmlFor="fillDate" className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="fillDate"
                name="fillDate"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={formData.fillDate}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="fuelAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Fuel Amount (gallons) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="fuelAmount"
                name="fuelAmount"
                step="0.01"
                min="0.1"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={formData.fuelAmount}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="distanceTraveled" className="block text-sm font-medium text-gray-700 mb-1">
                Distance (miles) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="distanceTraveled"
                name="distanceTraveled"
                step="0.1"
                min="1"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={formData.distanceTraveled}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="fuelCost" className="block text-sm font-medium text-gray-700 mb-1">
                Fuel Cost ($)
              </label>
              <input
                type="number"
                id="fuelCost"
                name="fuelCost"
                step="0.01"
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={formData.fuelCost}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="milesPerGallon" className="block text-sm font-medium text-gray-700 mb-1">
                Miles Per Gallon (calculated)
              </label>
              <input
                type="number"
                id="milesPerGallon"
                name="milesPerGallon"
                step="0.01"
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
                value={formData.milesPerGallon}
                onChange={handleChange}
                readOnly
              />
            </div>
          </div>

          <div className="my-4 p-4 bg-yellow-50 border border-yellow-300 rounded">
            <h3 className="font-semibold text-yellow-800">Valid Input Example:</h3>
            <ul className="list-disc pl-5 text-sm text-yellow-700 mt-1">
              <li>Vehicle: Select any vehicle from the dropdown</li>
              <li>Date: Today's date is already set by default</li>
              <li>Fuel Amount: 10.5 gallons</li>
              <li>Distance: 250 miles</li>
              <li>Fuel Cost: 38.50 dollars</li>
              <li>MPG: This is calculated automatically (23.8)</li>
            </ul>
            <p className="text-sm text-yellow-700 mt-2">
              Using a demo vehicle is recommended for testing as it doesn't require a working backend API.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Link to="/fuel-consumption" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary inline-flex items-center space-x-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Record</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFuelRecord; 