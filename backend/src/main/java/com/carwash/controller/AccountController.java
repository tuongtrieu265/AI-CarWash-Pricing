package com.carwash.controller;

import com.carwash.dto.response.ApiResponse;
import com.carwash.dto.response.UserResponse;
import com.carwash.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class AccountController {

    private final AuthService authService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(Authentication authentication) {
        UserResponse user = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @org.springframework.web.bind.annotation.PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            Authentication authentication,
            @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody com.carwash.dto.request.UpdateProfileRequest request) {
        UserResponse user = authService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin thành công", user));
    }
}