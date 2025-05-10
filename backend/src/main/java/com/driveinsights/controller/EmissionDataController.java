package com.driveinsights.controller;

import com.driveinsights.dto.EmissionDataDTO;
import com.driveinsights.service.EmissionDataService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/emissions")
@RequiredArgsConstructor
public class EmissionDataController {
    
    private final EmissionDataService emissionDataService;
    
    @GetMapping
    public ResponseEntity<List<EmissionDataDTO>> getAllEmissionData() {
        return ResponseEntity.ok(emissionDataService.getAllEmissionData());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<EmissionDataDTO> getEmissionDataById(@PathVariable Long id) {
        return ResponseEntity.ok(emissionDataService.getEmissionDataById(id));
    }
    
    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<EmissionDataDTO>> getEmissionDataByVehicleId(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(emissionDataService.getEmissionDataByVehicleId(vehicleId));
    }
    
    @GetMapping("/vehicle/{vehicleId}/date-range")
    public ResponseEntity<List<EmissionDataDTO>> getEmissionDataByVehicleIdAndDateRange(
            @PathVariable Long vehicleId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(emissionDataService.getEmissionDataByVehicleIdAndDateRange(vehicleId, startDate, endDate));
    }
    
    @PostMapping
    public ResponseEntity<EmissionDataDTO> createEmissionData(@Valid @RequestBody EmissionDataDTO emissionDataDTO) {
        return new ResponseEntity<>(emissionDataService.createEmissionData(emissionDataDTO), HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<EmissionDataDTO> updateEmissionData(
            @PathVariable Long id,
            @Valid @RequestBody EmissionDataDTO emissionDataDTO) {
        return ResponseEntity.ok(emissionDataService.updateEmissionData(id, emissionDataDTO));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmissionData(@PathVariable Long id) {
        emissionDataService.deleteEmissionData(id);
        return ResponseEntity.noContent().build();
    }
} 