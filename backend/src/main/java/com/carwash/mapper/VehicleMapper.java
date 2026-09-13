package com.carwash.mapper;

import com.carwash.dto.request.VehicleRequest;
import com.carwash.dto.response.VehicleResponse;
import com.carwash.entity.Vehicle;
import org.springframework.stereotype.Component;

@Component
public class VehicleMapper {

    public VehicleResponse toResponse(Vehicle vehicle) {
        if (vehicle == null) {
            return null;
        }
        return VehicleResponse.builder()
                .id(vehicle.getId())
                .licensePlate(vehicle.getLicensePlate())
                .vehicleType(vehicle.getVehicleType())
                .name(vehicle.getName())
                .build();
    }

    public Vehicle toEntity(VehicleRequest request) {
        if (request == null) {
            return null;
        }
        return Vehicle.builder()
                .licensePlate(request.getLicensePlate())
                .vehicleType(request.getVehicleType())
                .name(request.getName())
                .build();
    }

    public void updateEntity(VehicleRequest request, Vehicle vehicle) {
        if (request == null || vehicle == null) {
            return;
        }
        vehicle.setLicensePlate(request.getLicensePlate());
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setName(request.getName());
    }
}
