package com.carwash.dto.request;

import com.carwash.enums.VehicleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleRequest {
    @NotBlank(message = "License plate is required")
    @Size(max = 20, message = "License plate must not exceed 20 characters")
    private String licensePlate;

    @NotNull(message = "Vehicle type is required")
    private VehicleType vehicleType;

    @Size(max = 50, message = "Vehicle name must not exceed 50 characters")
    private String name;
}
