package com.driveinsights.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EngineDataDTO {
    private Long id;
    private Long vehicleId;
    private Double engineTemperature;
    private Integer engineRpm;
    private Integer idlingTimeSeconds;
    private LocalDateTime recordingTime;
} 