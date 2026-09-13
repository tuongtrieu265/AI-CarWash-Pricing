package com.carwash.repository;

import com.carwash.entity.OTPVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OTPVerificationRepository extends JpaRepository<OTPVerification, Long> {

    // Lấy mã OTP mới nhất chưa được sử dụng của một email
    Optional<OTPVerification> findTopByEmailAndUsedFalseOrderByCreatedAtDesc(String email);
}