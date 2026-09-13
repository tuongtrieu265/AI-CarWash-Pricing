package com.carwash.controller;

import com.carwash.dto.response.ApiResponse;
import com.carwash.service.OTPService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/otp")
@RequiredArgsConstructor
public class OTPController {

    private final OTPService otpService;

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<String>> sendOTP(@RequestParam String email) {
        otpService.generateAndSendOTP(email);
        return ResponseEntity.ok(ApiResponse.success("Mã OTP đã được gửi đến hệ thống cho: " + email, null));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Boolean>> verifyOTP(@RequestParam String email, @RequestParam String code) {
        boolean isValid = otpService.verifyOTP(email, code);
        return ResponseEntity.ok(ApiResponse.success("Xác thực OTP thành công", isValid));
    }
}