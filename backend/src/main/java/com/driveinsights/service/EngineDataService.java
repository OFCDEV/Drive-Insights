package com.driveinsights.service;

import com.driveinsights.dto.EngineDataDTO;
import com.driveinsights.model.EngineData;
import com.driveinsights.model.Vehicle;
import com.driveinsights.repository.EngineDataRepository;
import com.driveinsights.repository.VehicleRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EngineDataService {
    
    private final EngineDataRepository engineDataRepository;
    private final VehicleRepository vehicleRepository;
    
    public List<EngineDataDTO> getAllEngineData() {
        return engineDataRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public EngineDataDTO getEngineDataById(Long id) {
        return engineDataRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new EntityNotFoundException("Engine data not found with id: " + id));
    }
    
    public List<EngineDataDTO> getEngineDataByVehicleId(Long vehicleId) {
        return engineDataRepository.findByVehicleId(vehicleId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<EngineDataDTO> getEngineDataByVehicleIdAndDateRange(Long vehicleId, LocalDateTime startDate, LocalDateTime endDate) {
        return engineDataRepository.findByVehicleIdAndRecordingTimeBetween(vehicleId, startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public EngineDataDTO createEngineData(EngineDataDTO engineDataDTO) {
        Vehicle vehicle = vehicleRepository.findById(engineDataDTO.getVehicleId())
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with id: " + engineDataDTO.getVehicleId()));
        
        EngineData engineData = new EngineData();
        engineData.setVehicle(vehicle);
        engineData.setEngineTemperature(engineDataDTO.getEngineTemperature());
        engineData.setEngineRpm(engineDataDTO.getEngineRpm());
        engineData.setIdlingTimeSeconds(engineDataDTO.getIdlingTimeSeconds());
        engineData.setRecordingTime(engineDataDTO.getRecordingTime());
        
        return convertToDTO(engineDataRepository.save(engineData));
    }
    
    public EngineDataDTO updateEngineData(Long id, EngineDataDTO engineDataDTO) {
        EngineData engineData = engineDataRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Engine data not found with id: " + id));
        
        if (!engineData.getVehicle().getId().equals(engineDataDTO.getVehicleId())) {
            Vehicle newVehicle = vehicleRepository.findById(engineDataDTO.getVehicleId())
                    .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with id: " + engineDataDTO.getVehicleId()));
            engineData.setVehicle(newVehicle);
        }
        
        engineData.setEngineTemperature(engineDataDTO.getEngineTemperature());
        engineData.setEngineRpm(engineDataDTO.getEngineRpm());
        engineData.setIdlingTimeSeconds(engineDataDTO.getIdlingTimeSeconds());
        engineData.setRecordingTime(engineDataDTO.getRecordingTime());
        
        return convertToDTO(engineDataRepository.save(engineData));
    }
    
    public void deleteEngineData(Long id) {
        if (!engineDataRepository.existsById(id)) {
            throw new EntityNotFoundException("Engine data not found with id: " + id);
        }
        engineDataRepository.deleteById(id);
    }
    
    private EngineDataDTO convertToDTO(EngineData engineData) {
        return new EngineDataDTO(
                engineData.getId(),
                engineData.getVehicle().getId(),
                engineData.getEngineTemperature(),
                engineData.getEngineRpm(),
                engineData.getIdlingTimeSeconds(),
                engineData.getRecordingTime()
        );
    }
} 