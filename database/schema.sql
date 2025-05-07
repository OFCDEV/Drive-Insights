-- Create database
CREATE DATABASE drive_insights;

-- Connect to the database
\c drive_insights;

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    fuel_type VARCHAR(50),
    engine_size DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create fuel_consumption table
CREATE TABLE IF NOT EXISTS fuel_consumption (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    fuel_amount DECIMAL(10, 2) NOT NULL,
    distance_traveled DECIMAL(10, 2) NOT NULL,
    miles_per_gallon DECIMAL(10, 2),
    fuel_cost DECIMAL(10, 2),
    fill_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create engine_data table
CREATE TABLE IF NOT EXISTS engine_data (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    engine_temperature DECIMAL(6, 2) NOT NULL,
    engine_rpm INTEGER NOT NULL,
    idling_time_seconds INTEGER,
    recording_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create emission_data table
CREATE TABLE IF NOT EXISTS emission_data (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    co2_emissions DECIMAL(10, 2) NOT NULL,
    nox_emissions DECIMAL(10, 2),
    particulate_matter DECIMAL(10, 2),
    recording_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_fuel_consumption_vehicle_id ON fuel_consumption(vehicle_id);
CREATE INDEX idx_fuel_consumption_fill_date ON fuel_consumption(fill_date);
CREATE INDEX idx_engine_data_vehicle_id ON engine_data(vehicle_id);
CREATE INDEX idx_engine_data_recording_time ON engine_data(recording_time);
CREATE INDEX idx_emission_data_vehicle_id ON emission_data(vehicle_id);
CREATE INDEX idx_emission_data_recording_time ON emission_data(recording_time); 