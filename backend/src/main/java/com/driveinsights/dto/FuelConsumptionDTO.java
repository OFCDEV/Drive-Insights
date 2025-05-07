package com.driveinsights.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FuelConsumptionDTO {
    private Long id;
    private Long vehicleId;
    private Double fuelAmount;
    private Double distanceTraveled;
    private Double milesPerGallon;
    private Double fuelCost;
    private LocalDateTime fillDate;
} 