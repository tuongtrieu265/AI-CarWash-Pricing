package com.carwash.service;

import com.carwash.entity.OTPVerification;
import com.carwash.exception.BadRequestException;
import com.carwash.repository.OTPVerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class OTPService {

    private final OTPVerificationRepository otpRepository;
    private static final int OTP_EXPIRY_MINUTES = 5;

    @Transactional
    public void generateAndSendOTP(String email) {
        // Sinh mã ngẫu nhiên 6 chữ số
        String otpCode = String.format("%06d", new Random().nextInt(999999));
        
        OTPVerification verification = OTPVerification.builder()
                .email(email)
                .otpCode(otpCode)
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .used(false)
                .build();

        otpRepository.save(verification);

        // Giả lập gửi OTP - Trong thực tế sẽ tích hợp JavaMailSender. 
        // Hiện tại ta log ra Console để test và lấy mã.
        log.info("========================================");
        log.info("MÃ OTP XÁC THỰC CHO [{}]: {}", email, otpCode);
        log.info("========================================");
        System.out.println(">>> [MOCK EMAIL] Mã OTP của bạn là: " + otpCode);
    }

    @Transactional
    public boolean verifyOTP(String email, String code) {
        OTPVerification otpVerification = otpRepository
                .findTopByEmailAndUsedFalseOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy mã OTP hoặc mã đã được sử dụng"));

        if (otpVerification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Mã OTP đã hết hạn sử dụng");
        }

        if (!otpVerification.getOtpCode().equals(code)) {
            throw new BadRequestException("Mã OTP không chính xác");
        }

        // Đánh dấu mã đã sử dụng thành công
        otpVerification.setUsed(true);
        otpRepository.save(otpVerification);
        return true;
    }
}