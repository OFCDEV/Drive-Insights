package com.driveinsights.controller;

import com.driveinsights.dto.FuelConsumptionDTO;
import com.driveinsights.service.FuelConsumptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/fuel-consumption")
@RequiredArgsConstructor
public class FuelConsumptionController {
    
    private final FuelConsumptionService fuelConsumptionService;
    
    @GetMapping
    public ResponseEntity<List<FuelConsumptionDTO>> getAllFuelConsumptionData() {
        return ResponseEntity.ok(fuelConsumptionService.getAllFuelConsumptionData());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<FuelConsumptionDTO> getFuelConsumptionById(@PathVariable Long id) {
        return ResponseEntity.ok(fuelConsumptionService.getFuelConsumptionById(id));
    }
    
    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<FuelConsumptionDTO>> getFuelConsumptionByVehicleId(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(fuelConsumptionService.getFuelConsumptionByVehicleId(vehicleId));
    }
    
    @GetMapping("/vehicle/{vehicleId}/date-range")
    public ResponseEntity<List<FuelConsumptionDTO>> getFuelConsumptionByVehicleIdAndDateRange(
            @PathVariable Long vehicleId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(fuelConsumptionService.getFuelConsumptionByVehicleIdAndDateRange(vehicleId, startDate, endDate));
    }
    
    @GetMapping("/vehicle/{vehicleId}/average-mpg")
    public ResponseEntity<Double> getAverageMpgByVehicleId(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(fuelConsumptionService.getAverageMpgByVehicleId(vehicleId));
    }
    
    @PostMapping
    public ResponseEntity<FuelConsumptionDTO> createFuelConsumption(@Valid @RequestBody FuelConsumptionDTO fuelConsumptionDTO) {
        return new ResponseEntity<>(fuelConsumptionService.createFuelConsumption(fuelConsumptionDTO), HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<FuelConsumptionDTO> updateFuelConsumption(@PathVariable Long id, @Valid @RequestBody FuelConsumptionDTO fuelConsumptionDTO) {
        return ResponseEntity.ok(fuelConsumptionService.updateFuelConsumption(id, fuelConsumptionDTO));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFuelConsumption(@PathVariable Long id) {
        fuelConsumptionService.deleteFuelConsumption(id);
        return ResponseEntity.noContent().build();
    }
} 