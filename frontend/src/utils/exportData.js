// Function to convert data to CSV format
const convertToCSV = (data, headers) => {
  const headerRow = headers.map(h => h.label).join(',');
  const rows = data.map(record => {
    return headers
      .map(header => {
        let value = record[header.key];
        // Handle special cases like dates and numbers
        if (header.format) {
          value = header.format(value);
        }
        // Escape commas and quotes in the value
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(',');
  });
  return [headerRow, ...rows].join('\n');
};

// Function to download CSV file
const downloadCSV = (csvContent, fileName) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Main export function
export const exportData = (data, type, vehicle = null) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const vehicleInfo = vehicle ? `_${vehicle.make}_${vehicle.model}` : '';
  const fileName = `${type}_data${vehicleInfo}_${timestamp}.csv`;

  let headers = [];
  switch (type) {
    case 'fuel':
      headers = [
        { key: 'date', label: 'Date' },
        { key: 'vehicleId', label: 'Vehicle ID' },
        { key: 'amount', label: 'Fuel Amount (gal)', format: val => parseFloat(val).toFixed(1) },
        { key: 'distance', label: 'Distance (mi)', format: val => parseFloat(val).toFixed(1) },
        { key: 'mpg', label: 'MPG', format: val => parseFloat(val).toFixed(1) },
        { key: 'cost', label: 'Cost ($)', format: val => parseFloat(val).toFixed(2) }
      ];
      break;
    case 'engine':
      headers = [
        { key: 'date', label: 'Date' },
        { key: 'vehicleId', label: 'Vehicle ID' },
        { key: 'temperature', label: 'Temperature (°F)', format: val => parseFloat(val).toFixed(1) },
        { key: 'rpm', label: 'RPM', format: val => parseFloat(val).toFixed(0) },
        { key: 'idlingTime', label: 'Idling Time (sec)', format: val => parseFloat(val).toFixed(0) }
      ];
      break;
    case 'emissions':
      headers = [
        { key: 'date', label: 'Date' },
        { key: 'vehicleId', label: 'Vehicle ID' },
        { key: 'co2', label: 'CO2 (g/km)', format: val => parseFloat(val).toFixed(1) },
        { key: 'nox', label: 'NOx (g/km)', format: val => parseFloat(val).toFixed(3) },
        { key: 'pm', label: 'PM (g/km)', format: val => parseFloat(val).toFixed(4) }
      ];
      break;
    default:
      throw new Error('Invalid data type for export');
  }

  const csvContent = convertToCSV(data, headers);
  downloadCSV(csvContent, fileName);
}; 