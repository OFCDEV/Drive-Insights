package com.driveinsights.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "engine_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EngineData {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;
    
    @Column(name = "engine_temperature", nullable = false)
    private Double engineTemperature;
    
    @Column(name = "engine_rpm", nullable = false)
    private Integer engineRpm;
    
    @Column(name = "idling_time_seconds")
    private Integer idlingTimeSeconds;
    
    @Column(name = "recording_time", nullable = false)
    private LocalDateTime recordingTime;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
} 