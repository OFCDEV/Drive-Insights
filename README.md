# Drive Insights

A web application that provides interactive dashboards for visualizing vehicle data. This application empowers users to monitor and analyze various aspects of vehicle performance, including fuel consumption, engine behavior, and environmental impact.

## Features

- **Interactive Dashboards:** Display vehicle data in an engaging and interactive manner
- **Fuel Consumption Analysis:** Track fuel efficiency over time
- **Engine Behavior Monitoring:** Display engine temperature readings and RPM distribution
- **Environmental Impact Assessment:** Calculate and display CO2 emissions
- **Data Persistence:** Store and retrieve vehicle data from a PostgreSQL database

## Tech Stack

### Backend
- Java with Spring Boot
- Hibernate ORM
- PostgreSQL database

### Frontend
- React
- Chart.js for data visualization
- Shadcn UI components

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 14+

### Environment Setup
1. In the `backend` directory, copy `.env.template` to `.env`
2. Update the `.env` file with your PostgreSQL credentials:
   ```
   DB_URL=jdbc:postgresql://localhost:5432/drive_insights
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

### Backend Setup
1. Navigate to the `backend` directory
2. Run `./mvnw clean install` to build the project
3. Run `./mvnw spring-boot:run` to start the server

### Frontend Setup
1. Navigate to the `frontend` directory
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server

### Database Setup
1. Create a PostgreSQL database named `drive_insights`
2. Run the SQL scripts in the `database` directory to set up the schema

## Color Palette
- Primary Color: Dark Blue (#1A237E)
- Secondary Color: Light Gray (#EEEEEE)
- Accent Color: Teal (#00BCD4) 