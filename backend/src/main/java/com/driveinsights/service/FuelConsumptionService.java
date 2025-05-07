package com.driveinsights.service;

import com.driveinsights.dto.FuelConsumptionDTO;
import com.driveinsights.model.FuelConsumption;
import com.driveinsights.model.Vehicle;
import com.driveinsights.repository.FuelConsumptionRepository;
import com.driveinsights.repository.VehicleRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FuelConsumptionService {
    
    private final FuelConsumptionRepository fuelConsumptionRepository;
    private final VehicleRepository vehicleRepository;
    
    public List<FuelConsumptionDTO> getAllFuelConsumptionData() {
        return fuelConsumptionRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<FuelConsumptionDTO> getFuelConsumptionByVehicleId(Long vehicleId) {
        return fuelConsumptionRepository.findByVehicleId(vehicleId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<FuelConsumptionDTO> getFuelConsumptionByVehicleIdAndDateRange(
            Long vehicleId, LocalDateTime startDate, LocalDateTime endDate) {
        return fuelConsumptionRepository.findByVehicleIdAndFillDateBetween(vehicleId, startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public Double getAverageMpgByVehicleId(Long vehicleId) {
        return fuelConsumptionRepository.findAverageMpgByVehicleId(vehicleId);
    }
    
    public FuelConsumptionDTO getFuelConsumptionById(Long id) {
        FuelConsumption fuelConsumption = fuelConsumptionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Fuel consumption data not found with id: " + id));
        return convertToDTO(fuelConsumption);
    }
    
    public FuelConsumptionDTO createFuelConsumption(FuelConsumptionDTO fuelConsumptionDTO) {
        FuelConsumption fuelConsumption = convertToEntity(fuelConsumptionDTO);
        FuelConsumption savedFuelConsumption = fuelConsumptionRepository.save(fuelConsumption);
        return convertToDTO(savedFuelConsumption);
    }
    
    public FuelConsumptionDTO updateFuelConsumption(Long id, FuelConsumptionDTO fuelConsumptionDTO) {
        FuelConsumption existingFuelConsumption = fuelConsumptionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Fuel consumption data not found with id: " + id));
        
        Vehicle vehicle = vehicleRepository.findById(fuelConsumptionDTO.getVehicleId())
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with id: " + fuelConsumptionDTO.getVehicleId()));
        
        existingFuelConsumption.setVehicle(vehicle);
        existingFuelConsumption.setFuelAmount(fuelConsumptionDTO.getFuelAmount());
        existingFuelConsumption.setDistanceTraveled(fuelConsumptionDTO.getDistanceTraveled());
        existingFuelConsumption.setMilesPerGallon(fuelConsumptionDTO.getMilesPerGallon());
        existingFuelConsumption.setFuelCost(fuelConsumptionDTO.getFuelCost());
        existingFuelConsumption.setFillDate(fuelConsumptionDTO.getFillDate());
        
        FuelConsumption updatedFuelConsumption = fuelConsumptionRepository.save(existingFuelConsumption);
        return convertToDTO(updatedFuelConsumption);
    }
    
    public void deleteFuelConsumption(Long id) {
        if (!fuelConsumptionRepository.existsById(id)) {
            throw new EntityNotFoundException("Fuel consumption data not found with id: " + id);
        }
        fuelConsumptionRepository.deleteById(id);
    }
    
    private FuelConsumptionDTO convertToDTO(FuelConsumption fuelConsumption) {
        return new FuelConsumptionDTO(
                fuelConsumption.getId(),
                fuelConsumption.getVehicle().getId(),
                fuelConsumption.getFuelAmount(),
                fuelConsumption.getDistanceTraveled(),
                fuelConsumption.getMilesPerGallon(),
                fuelConsumption.getFuelCost(),
                fuelConsumption.getFillDate()
        );
    }
    
    private FuelConsumption convertToEntity(FuelConsumptionDTO fuelConsumptionDTO) {
        FuelConsumption fuelConsumption = new FuelConsumption();
        fuelConsumption.setId(fuelConsumptionDTO.getId());
        
        Vehicle vehicle = vehicleRepository.findById(fuelConsumptionDTO.getVehicleId())
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with id: " + fuelConsumptionDTO.getVehicleId()));
        
        fuelConsumption.setVehicle(vehicle);
        fuelConsumption.setFuelAmount(fuelConsumptionDTO.getFuelAmount());
        fuelConsumption.setDistanceTraveled(fuelConsumptionDTO.getDistanceTraveled());
        fuelConsumption.setMilesPerGallon(fuelConsumptionDTO.getMilesPerGallon());
        fuelConsumption.setFuelCost(fuelConsumptionDTO.getFuelCost());
        fuelConsumption.setFillDate(fuelConsumptionDTO.getFillDate());
        
        return fuelConsumption;
    }
} 