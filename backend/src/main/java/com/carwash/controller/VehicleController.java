package com.carwash.controller;

import com.carwash.dto.request.VehicleRequest;
import com.carwash.dto.response.ApiResponse;
import com.carwash.dto.response.VehicleResponse;
import com.carwash.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getCustomerVehicles(Authentication authentication) {
        List<VehicleResponse> vehicles = vehicleService.getCustomerVehicles(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Lay danh sach xe thanh cong", vehicles));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VehicleResponse>> addVehicle(
            Authentication authentication,
            @Valid @RequestBody VehicleRequest request) {
        VehicleResponse savedVehicle = vehicleService.addVehicle(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Them xe thanh cong", savedVehicle));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> updateVehicle(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody VehicleRequest request) {
        VehicleResponse updatedVehicle = vehicleService.updateVehicle(authentication.getName(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Cap nhat xe thanh cong", updatedVehicle));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(
            Authentication authentication,
            @PathVariable Long id) {
        vehicleService.deleteVehicle(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Xoa xe thanh cong", null));
    }
}
