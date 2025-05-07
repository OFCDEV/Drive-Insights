package com.driveinsights.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmissionDataDTO {
    private Long id;
    private Long vehicleId;
    private Double co2Emissions;
    private Double noxEmissions;
    private Double particulateMatter;
    private LocalDateTime recordingTime;
} 