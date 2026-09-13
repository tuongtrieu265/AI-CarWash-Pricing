package com.carwash.entity;

import com.carwash.enums.VehicleType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "vehicles", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"license_plate", "user_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "User is required")
    private User user;
    @NotBlank(message = "License plate is required")
    @Size(max = 20, message = "License plate must not exceed 20 characters")
    @Column(name = "license_plate", nullable = false, length = 20)
    private String licensePlate;
    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", nullable = false, length = 20)
    @NotNull(message = "Vehicle type is required")
    @Builder.Default
    private VehicleType vehicleType = VehicleType.XE_MAY; // Giả sử mặc định là xe máy
    @Size(max = 50, message = "Vehicle name must not exceed 50 characters")
    @Column(name = "name", length = 50)
    private String name;

}
