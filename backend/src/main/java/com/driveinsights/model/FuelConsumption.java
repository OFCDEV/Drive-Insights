package com.driveinsights.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "fuel_consumption")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FuelConsumption {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;
    
    @Column(name = "fuel_amount", nullable = false)
    private Double fuelAmount;
    
    @Column(name = "distance_traveled", nullable = false)
    private Double distanceTraveled;
    
    @Column(name = "miles_per_gallon")
    private Double milesPerGallon;
    
    @Column(name = "fuel_cost")
    private Double fuelCost;
    
    @Column(name = "fill_date", nullable = false)
    private LocalDateTime fillDate;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        
        // Calculate MPG if not provided
        if (this.milesPerGallon == null && this.fuelAmount > 0) {
            this.milesPerGallon = this.distanceTraveled / this.fuelAmount;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
} 