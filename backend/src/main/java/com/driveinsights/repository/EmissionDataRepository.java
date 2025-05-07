package com.driveinsights.repository;

import com.driveinsights.model.EmissionData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EmissionDataRepository extends JpaRepository<EmissionData, Long> {
    List<EmissionData> findByVehicleId(Long vehicleId);
    
    List<EmissionData> findByVehicleIdAndRecordingTimeBetween(
            Long vehicleId, LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT AVG(ed.co2Emissions) FROM EmissionData ed WHERE ed.vehicle.id = :vehicleId")
    Double findAverageCo2EmissionsByVehicleId(@Param("vehicleId") Long vehicleId);
    
    @Query("SELECT SUM(ed.co2Emissions) FROM EmissionData ed WHERE ed.vehicle.id = :vehicleId")
    Double findTotalCo2EmissionsByVehicleId(@Param("vehicleId") Long vehicleId);
} 