package com.driveinsights.repository;

import com.driveinsights.model.EngineData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EngineDataRepository extends JpaRepository<EngineData, Long> {
    List<EngineData> findByVehicleId(Long vehicleId);
    
    List<EngineData> findByVehicleIdAndRecordingTimeBetween(
            Long vehicleId, LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT AVG(ed.engineTemperature) FROM EngineData ed WHERE ed.vehicle.id = :vehicleId")
    Double findAverageEngineTemperatureByVehicleId(@Param("vehicleId") Long vehicleId);
    
    @Query("SELECT AVG(ed.engineRpm) FROM EngineData ed WHERE ed.vehicle.id = :vehicleId")
    Double findAverageEngineRpmByVehicleId(@Param("vehicleId") Long vehicleId);
    
    @Query("SELECT SUM(ed.idlingTimeSeconds) FROM EngineData ed WHERE ed.vehicle.id = :vehicleId")
    Integer findTotalIdlingTimeByVehicleId(@Param("vehicleId") Long vehicleId);
} 