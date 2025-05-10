# Drive Insights Backend Documentation

This document provides a comprehensive overview of the backend codebase structure and functionality.

## Project Structure

```
backend/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── driveinsights/
│       │           ├── config/        # Configuration classes
│       │           ├── controller/    # REST API controllers
│       │           ├── dto/           # Data Transfer Objects
│       │           ├── model/         # Entity models
│       │           ├── repository/    # Data access layer
│       │           ├── service/       # Business logic
│       │           └── DriveInsightsApplication.java
│       └── resources/
│           └── application.properties # Application configuration
├── .env              # Environment variables (not in Git)
├── .env.template     # Template for environment variables
├── pom.xml          # Project dependencies and build configuration
└── target/          # Compiled files (not in Git)
```

## Key Components

### Configuration Files

1. **application.properties**
   - Location: `src/main/resources/application.properties`
   - Purpose: Main configuration file for the Spring Boot application
   - Contains:
     - Database connection settings
     - Hibernate configuration
     - Logging settings
     - CORS configuration
     - API documentation settings

2. **Environment Files**
   - `.env`: Contains actual configuration values (not committed to Git)
   - `.env.template`: Template showing required environment variables
   - Variables:
     - `DB_URL`: Database connection URL
     - `DB_USERNAME`: Database username
     - `DB_PASSWORD`: Database password

### Java Packages

1. **config/**
   - Contains configuration classes for Spring Boot
   - Includes security, CORS, and other application configurations

2. **controller/**
   - REST API endpoints
   - Controllers:
     - VehicleController: Vehicle management
     - FuelConsumptionController: Fuel data management
     - EngineDataController: Engine monitoring
     - EmissionDataController: Emissions tracking

3. **dto/**
   - Data Transfer Objects for API requests/responses
   - Classes:
     - VehicleDTO
     - FuelConsumptionDTO
     - EngineDataDTO
     - EmissionDataDTO

4. **model/**
   - JPA entity classes representing database tables
   - Entities:
     - Vehicle
     - FuelConsumption
     - EngineData
     - EmissionData

5. **repository/**
   - JPA repositories for database operations
   - Interfaces:
     - VehicleRepository
     - FuelConsumptionRepository
     - EngineDataRepository
     - EmissionDataRepository

6. **service/**
   - Business logic implementation
   - Services:
     - VehicleService
     - FuelConsumptionService
     - EngineDataService
     - EmissionDataService

### Main Application

**DriveInsightsApplication.java**
- Location: `src/main/java/com/driveinsights/DriveInsightsApplication.java`
- Purpose: Application entry point
- Contains the main method and Spring Boot configuration

### Dependencies (pom.xml)

Key dependencies include:
- Spring Boot Starter Web
- Spring Boot Starter Data JPA
- PostgreSQL Driver
- Spring Boot Starter Validation
- Lombok
- SpringDoc OpenAPI (Swagger)

## Database Schema

The application uses PostgreSQL with the following main tables:

1. **vehicles**
   - Primary key: id
   - Fields: make, model, year, license_plate, etc.

2. **fuel_consumption**
   - Primary key: id
   - Foreign key: vehicle_id
   - Fields: fuel_amount, distance_traveled, mpg, cost, etc.

3. **engine_data**
   - Primary key: id
   - Foreign key: vehicle_id
   - Fields: temperature, rpm, idling_time, etc.

4. **emission_data**
   - Primary key: id
   - Foreign key: vehicle_id
   - Fields: co2_emissions, nox_emissions, particulate_matter, etc.

## Entity Relationship Diagram

```
+----------------+       +-----------------+
|    Vehicle     |       | FuelConsumption |
+----------------+       +-----------------+
| *id            |       | *id             |
| make           |       | vehicle_id (FK) |
| model          |       | fuel_amount     |
| year           |<----->| distance        |
| license_plate  |  1:N  | mpg             |
| fuel_type      |       | cost            |
| engine_size    |       | fill_date       |
| created_at     |       | created_at      |
| updated_at     |       | updated_at      |
+----------------+       +-----------------+

+----------------+       +-----------------+
|  EngineData    |       |  EmissionData   |
+----------------+       +-----------------+
| *id            |       | *id             |
| vehicle_id (FK)|       | vehicle_id (FK) |
| temperature    |       | co2_emissions   |
| rpm            |       | nox_emissions   |
| idling_time    |       | particulate     |
| recording_time |       | recording_time  |
| created_at     |       | created_at      |
| updated_at     |       | updated_at      |
+----------------+       +-----------------+
        ^                       ^
        |         1:N           |
        +--------------------+  |
                            |  |
                    +----------------+
                    |    Vehicle     |
                    +----------------+
```

Relationships:
- One Vehicle can have many FuelConsumption records (1:N)
- One Vehicle can have many EngineData records (1:N)
- One Vehicle can have many EmissionData records (1:N)

Key:
- *: Primary Key
- FK: Foreign Key
- 1:N: One-to-Many relationship

## API Endpoints

The application exposes RESTful APIs for:

1. **Vehicle Management**
   - GET /api/vehicles
   - POST /api/vehicles
   - GET /api/vehicles/{id}
   - PUT /api/vehicles/{id}
   - DELETE /api/vehicles/{id}

2. **Fuel Consumption**
   - GET /api/fuel-consumption
   - POST /api/fuel-consumption
   - GET /api/fuel-consumption/{id}

3. **Engine Monitoring**
   - GET /api/engine-data
   - POST /api/engine-data
   - GET /api/engine-data/{id}

4. **Emissions Data**
   - GET /api/emissions
   - POST /api/emissions
   - GET /api/emissions/{id}

## Security

- Database credentials are stored in environment variables
- CORS configuration is implemented
- Input validation using Jakarta Validation
- JPA entity relationships are properly configured

## Building and Running

1. Set up environment variables:
   ```bash
   cp .env.template .env
   # Edit .env with your database credentials
   ```

2. Build the project:
   ```bash
   ./mvnw clean install
   ```

3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

The application will start on port 8080 by default. 