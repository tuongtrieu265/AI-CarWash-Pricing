package com.carwash.controller;

import com.carwash.dto.request.LoginRequest;
import com.carwash.dto.request.RegisterRequest;
import com.carwash.dto.response.ApiResponse;
import com.carwash.dto.response.AuthResponse;
import com.carwash.dto.response.UserResponse;
import com.carwash.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        authService.logout(authHeader);
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công", null));
    }

    // Tạm giữ lại endpoint này nếu frontend đang dùng, nhưng đúng ra nó nên ở AccountController
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(Authentication authentication) {
        UserResponse user = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(user));
    }
}
