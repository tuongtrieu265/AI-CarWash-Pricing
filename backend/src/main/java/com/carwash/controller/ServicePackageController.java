package com.carwash.controller;

import com.carwash.dto.response.ApiResponse;
import com.carwash.dto.response.ServicePackageResponse;
import com.carwash.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServicePackageController {

    private final BookingService bookingService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ServicePackageResponse>>> getActiveServices() {
        List<ServicePackageResponse> services = bookingService.getActiveServicePackages();
        return ResponseEntity.ok(ApiResponse.success(services));
    }
}
