package com.carwash.service;

import com.carwash.config.JwtService;
import com.carwash.dto.request.RegisterRequest;
import com.carwash.dto.response.AuthResponse;
import com.carwash.entity.AuthSession;
import com.carwash.entity.User;
import com.carwash.enums.Role;
import com.carwash.exception.BadRequestException;
import com.carwash.repository.SessionRepository;
import com.carwash.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private SessionRepository sessionRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private AuthenticationManager authenticationManager;

    @InjectMocks private AuthService authService;

    private RegisterRequest registerRequest;
    private User mockUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest("Test User", "test@gmail.com", "password123", "0123456789");
        mockUser = User.builder().id(1L).email("test@gmail.com").role(Role.ROLE_CUSTOMER).build();
    }

    @Test
    void testRegister_Success() {
        // Giả lập (Mock) các phản hồi từ Database
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);
        when(jwtService.generateToken(any(User.class))).thenReturn("mockJwtToken");

        // Chạy hàm thực tế
        AuthResponse response = authService.register(registerRequest);

        // Kiểm tra kết quả
        assertNotNull(response);
        assertEquals("mockJwtToken", response.getToken());
        
        // Đảm bảo session đã được tạo và lưu xuống DB 1 lần
        verify(sessionRepository, times(1)).save(any(AuthSession.class));
    }

    @Test
    void testRegister_Fail_EmailAlreadyExists() {
        // Giả lập email đã tồn tại
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // Kiểm tra xem hàm có ném ra lỗi BadRequest không
        assertThrows(BadRequestException.class, () -> authService.register(registerRequest));
        
        // Đảm bảo không có user nào được lưu xuống DB
        verify(userRepository, never()).save(any(User.class));
    }
}