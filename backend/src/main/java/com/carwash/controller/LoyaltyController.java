package com.carwash.controller;

import com.carwash.dto.response.ApiResponse;
import com.carwash.dto.response.LoyaltyResponse;
import com.carwash.service.LoyaltyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/loyalty")
@RequiredArgsConstructor
public class LoyaltyController {

    private final LoyaltyService loyaltyService;
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<LoyaltyResponse>> getLoyaltyProfile(Authentication authentication) {
        LoyaltyResponse profile = loyaltyService.getLoyaltyProfile(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }
}
