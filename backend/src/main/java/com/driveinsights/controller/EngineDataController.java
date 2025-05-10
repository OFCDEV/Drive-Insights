package com.driveinsights.controller;

import com.driveinsights.dto.EngineDataDTO;
import com.driveinsights.service.EngineDataService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/engine-data")
@RequiredArgsConstructor
public class EngineDataController {
    
    private final EngineDataService engineDataService;
    
    @GetMapping
    public ResponseEntity<List<EngineDataDTO>> getAllEngineData() {
        return ResponseEntity.ok(engineDataService.getAllEngineData());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<EngineDataDTO> getEngineDataById(@PathVariable Long id) {
        return ResponseEntity.ok(engineDataService.getEngineDataById(id));
    }
    
    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<EngineDataDTO>> getEngineDataByVehicleId(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(engineDataService.getEngineDataByVehicleId(vehicleId));
    }
    
    @GetMapping("/vehicle/{vehicleId}/date-range")
    public ResponseEntity<List<EngineDataDTO>> getEngineDataByVehicleIdAndDateRange(
            @PathVariable Long vehicleId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(engineDataService.getEngineDataByVehicleIdAndDateRange(vehicleId, startDate, endDate));
    }
    
    @PostMapping
    public ResponseEntity<EngineDataDTO> createEngineData(@Valid @RequestBody EngineDataDTO engineDataDTO) {
        return new ResponseEntity<>(engineDataService.createEngineData(engineDataDTO), HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<EngineDataDTO> updateEngineData(@PathVariable Long id, @Valid @RequestBody EngineDataDTO engineDataDTO) {
        return ResponseEntity.ok(engineDataService.updateEngineData(id, engineDataDTO));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEngineData(@PathVariable Long id) {
        engineDataService.deleteEngineData(id);
        return ResponseEntity.noContent().build();
    }
} 