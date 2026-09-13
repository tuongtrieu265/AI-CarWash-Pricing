package com.carwash.service;

import com.carwash.config.JwtService;
import com.carwash.dto.request.LoginRequest;
import com.carwash.dto.request.RegisterRequest;
import com.carwash.dto.response.AuthResponse;
import com.carwash.dto.response.UserResponse;
import com.carwash.entity.AuthSession;
import com.carwash.entity.User;
import com.carwash.enums.LoyaltyTier;
import com.carwash.enums.Role;
import com.carwash.exception.BadRequestException;
import com.carwash.exception.ResourceNotFoundException;
import com.carwash.repository.SessionRepository;
import com.carwash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email này đã được đăng ký hệ thống");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.ROLE_CUSTOMER)
                .loyaltyPoints(0)
                .loyaltyTier(LoyaltyTier.BRONZE)
                .build();

        user = userRepository.save(user);
        String token = jwtService.generateToken(user);
        
        // Tạo phiên đăng nhập cho user
        createAuthSession(user, token);

        return AuthResponse.builder()
                .token(token)
                .user(mapToUserResponse(user))
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        String token = jwtService.generateToken(user);
        
        // Tạo phiên đăng nhập mới cho user
        createAuthSession(user, token);

        return AuthResponse.builder()
                .token(token)
                .user(mapToUserResponse(user))
                .build();
    }

    @Transactional
    public void logout(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new BadRequestException("Mã Token không hợp lệ");
        }
        String token = authHeader.substring(7);
        AuthSession session = sessionRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Session", "token", "JWT"));
        
        // Thu hồi session (Đăng xuất)
        session.setRevoked(true);
        sessionRepository.save(session);
    }

    private void createAuthSession(User user, String token) {
        AuthSession session = AuthSession.builder()
                .user(user)
                .token(token)
                .revoked(false)
                .expiresAt(LocalDateTime.now().plusHours(24)) // Phù hợp cấu hình 24h trong yml
                .build();
        sessionRepository.save(session);
    }

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return mapToUserResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(String email, com.carwash.dto.request.UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        
        user = userRepository.save(user);
        return mapToUserResponse(user);
    }

    public static UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .loyaltyPoints(user.getLoyaltyPoints())
                .loyaltyTier(user.getLoyaltyTier())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .build();
    }
}
