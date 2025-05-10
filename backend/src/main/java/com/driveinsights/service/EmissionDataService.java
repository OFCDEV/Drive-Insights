package com.driveinsights.service;

import com.driveinsights.dto.EmissionDataDTO;
import com.driveinsights.model.EmissionData;
import com.driveinsights.model.Vehicle;
import com.driveinsights.repository.EmissionDataRepository;
import com.driveinsights.repository.VehicleRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmissionDataService {
    
    private final EmissionDataRepository emissionDataRepository;
    private final VehicleRepository vehicleRepository;
    
    public List<EmissionDataDTO> getAllEmissionData() {
        return emissionDataRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public EmissionDataDTO getEmissionDataById(Long id) {
        return emissionDataRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new EntityNotFoundException("Emission data not found with id: " + id));
    }
    
    public List<EmissionDataDTO> getEmissionDataByVehicleId(Long vehicleId) {
        return emissionDataRepository.findByVehicleId(vehicleId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<EmissionDataDTO> getEmissionDataByVehicleIdAndDateRange(Long vehicleId, LocalDateTime startDate, LocalDateTime endDate) {
        return emissionDataRepository.findByVehicleIdAndRecordingTimeBetween(vehicleId, startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public EmissionDataDTO createEmissionData(EmissionDataDTO emissionDataDTO) {
        Vehicle vehicle = vehicleRepository.findById(emissionDataDTO.getVehicleId())
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with id: " + emissionDataDTO.getVehicleId()));
        
        EmissionData emissionData = new EmissionData();
        emissionData.setVehicle(vehicle);
        emissionData.setCo2Emissions(emissionDataDTO.getCo2Emissions());
        emissionData.setNoxEmissions(emissionDataDTO.getNoxEmissions());
        emissionData.setParticulateMatter(emissionDataDTO.getParticulateMatter());
        emissionData.setRecordingTime(emissionDataDTO.getRecordingTime());
        
        return convertToDTO(emissionDataRepository.save(emissionData));
    }
    
    public EmissionDataDTO updateEmissionData(Long id, EmissionDataDTO emissionDataDTO) {
        EmissionData emissionData = emissionDataRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Emission data not found with id: " + id));
        
        if (!emissionData.getVehicle().getId().equals(emissionDataDTO.getVehicleId())) {
            Vehicle newVehicle = vehicleRepository.findById(emissionDataDTO.getVehicleId())
                    .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with id: " + emissionDataDTO.getVehicleId()));
            emissionData.setVehicle(newVehicle);
        }
        
        emissionData.setCo2Emissions(emissionDataDTO.getCo2Emissions());
        emissionData.setNoxEmissions(emissionDataDTO.getNoxEmissions());
        emissionData.setParticulateMatter(emissionDataDTO.getParticulateMatter());
        emissionData.setRecordingTime(emissionDataDTO.getRecordingTime());
        
        return convertToDTO(emissionDataRepository.save(emissionData));
    }
    
    public void deleteEmissionData(Long id) {
        if (!emissionDataRepository.existsById(id)) {
            throw new EntityNotFoundException("Emission data not found with id: " + id);
        }
        emissionDataRepository.deleteById(id);
    }
    
    private EmissionDataDTO convertToDTO(EmissionData emissionData) {
        return new EmissionDataDTO(
                emissionData.getId(),
                emissionData.getVehicle().getId(),
                emissionData.getCo2Emissions(),
                emissionData.getNoxEmissions(),
                emissionData.getParticulateMatter(),
                emissionData.getRecordingTime()
        );
    }
} 