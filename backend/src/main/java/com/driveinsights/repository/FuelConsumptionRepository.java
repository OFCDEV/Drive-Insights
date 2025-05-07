package com.driveinsights.repository;

import com.driveinsights.model.FuelConsumption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FuelConsumptionRepository extends JpaRepository<FuelConsumption, Long> {
    List<FuelConsumption> findByVehicleId(Long vehicleId);
    
    List<FuelConsumption> findByVehicleIdAndFillDateBetween(
            Long vehicleId, LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT AVG(fc.milesPerGallon) FROM FuelConsumption fc WHERE fc.vehicle.id = :vehicleId")
    Double findAverageMpgByVehicleId(@Param("vehicleId") Long vehicleId);
} 