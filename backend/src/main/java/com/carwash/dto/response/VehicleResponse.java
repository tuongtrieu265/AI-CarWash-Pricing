package com.carwash.dto.response;

import com.carwash.enums.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleResponse {
    private Long id;
    private String licensePlate;
    private VehicleType vehicleType;
    private String name;
}
