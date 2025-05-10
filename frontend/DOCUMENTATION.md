# Drive Insights Frontend Documentation

This document provides a comprehensive overview of the frontend codebase structure and functionality.

## Project Structure

```
frontend/
├── src/
│   ├── assets/         # Static assets (images, icons)
│   ├── components/     # Reusable UI components
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── services/       # API service functions
│   ├── utils/          # Utility functions
│   ├── App.js          # Root component
│   ├── index.js        # Application entry point
│   └── index.css       # Global styles
├── public/             # Public assets
├── package.json        # Dependencies and scripts
└── .env               # Environment variables (not in Git)
```

## Key Components

### Pages

1. **Dashboard (`pages/Dashboard.jsx`)**
   - Main dashboard with overview of all metrics
   - Quick access to all main features
   - Summary cards and statistics

2. **Vehicle Management (`pages/VehicleManagement.jsx`)**
   - List of all vehicles
   - Add/Edit/Delete vehicle functionality
   - Vehicle details view

3. **Fuel Consumption (`pages/FuelConsumption.jsx`)**
   - Fuel consumption tracking
   - MPG calculations and trends
   - Cost analysis charts
   - Features:
     - Filter by date range and vehicle
     - Export data functionality
     - Interactive charts

4. **Engine Monitoring (`pages/EngineMonitoring.jsx`)**
   - Real-time engine data display
   - Temperature and RPM monitoring
   - Idling time tracking
   - Features:
     - Live data updates
     - Historical data view
     - Alert indicators

5. **Emissions Data (`pages/EmissionsData.jsx`)**
   - Emissions tracking and analysis
   - CO2, NOx, and PM measurements
   - Environmental impact assessment
   - Features:
     - Emissions trends
     - Vehicle comparison
     - Export functionality

### Components

1. **Layout Components**
   - `Navbar`: Main navigation
   - `Sidebar`: Quick access menu
   - `Footer`: Page footer
   - `Layout`: Page layout wrapper

2. **Data Display**
   - `DataTable`: Reusable table component
   - `Chart`: Wrapper for Chart.js
   - `StatCard`: Statistics display card
   - `MetricDisplay`: Numerical metrics display

3. **Forms**
   - `VehicleForm`: Vehicle data entry
   - `FuelRecordForm`: Fuel consumption entry
   - `EngineDataForm`: Engine data entry
   - `EmissionsForm`: Emissions data entry

4. **UI Elements**
   - `Button`: Custom styled buttons
   - `Input`: Form input fields
   - `Select`: Dropdown component
   - `DatePicker`: Date selection
   - `Alert`: Notification component

### Context Providers

1. **ThemeContext**
   - Dark/Light mode management
   - Theme customization
   - Color scheme settings

2. **AuthContext**
   - User authentication state
   - Login/Logout functionality
   - Permission management

### Custom Hooks

1. **Data Hooks**
   - `useVehicles`: Vehicle data management
   - `useFuelData`: Fuel consumption data
   - `useEngineData`: Engine monitoring data
   - `useEmissionsData`: Emissions data

2. **Utility Hooks**
   - `useDebounce`: Input debouncing
   - `usePagination`: Data pagination
   - `useSort`: Data sorting
   - `useFilter`: Data filtering

### Services

1. **API Services**
   - `vehicleService`: Vehicle API calls
   - `fuelService`: Fuel data API calls
   - `engineService`: Engine data API calls
   - `emissionService`: Emissions API calls

2. **Utility Services**
   - `authService`: Authentication
   - `exportService`: Data export
   - `chartService`: Chart configuration

## State Management

The application uses a combination of:
- React Context for global state
- Local state for component-specific data
- Custom hooks for shared logic

## Data Flow

```
API Call → Service → Hook → Component → User Interface
   ↑          ↓        ↓         ↓
   └──────────────── Context ────┘
```

## Styling

1. **CSS Architecture**
   - Tailwind CSS for utility classes
   - Custom CSS modules for components
   - Global styles in index.css
   - Dark mode support

2. **Theme Configuration**
   - Custom color palette
   - Responsive design breakpoints
   - Component-specific themes

## Charts and Visualizations

Using Chart.js for:
- Line charts (trends)
- Bar charts (comparisons)
- Doughnut charts (distribution)
- Custom chart configurations

## Error Handling

1. **Error Boundaries**
   - Component-level error catching
   - Fallback UI components
   - Error reporting

2. **Form Validation**
   - Input validation
   - Error messages
   - Field-level validation

## Performance Optimization

1. **Code Splitting**
   - Lazy loading of pages
   - Component code splitting
   - Dynamic imports

2. **Caching**
   - API response caching
   - Local storage usage
   - Memory caching

## Building and Running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment:
   ```bash
   cp .env.template .env
   # Edit .env with your configuration
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

The development server will start on port 3000 by default.

## Testing

1. **Unit Tests**
   ```bash
   npm run test
   ```

2. **E2E Tests**
   ```bash
   npm run test:e2e
   ```

## Best Practices

1. **Code Organization**
   - Feature-based directory structure
   - Component composition
   - Custom hooks for logic reuse

2. **Performance**
   - Memoization where needed
   - Efficient re-rendering
   - Asset optimization

3. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support 