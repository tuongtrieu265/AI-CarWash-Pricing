package com.carwash.controller;
import com.carwash.dto.request.MachineStatusRequest;
import com.carwash.dto.response.*;
import com.carwash.enums.BookingStatus;
import com.carwash.enums.PaymentStatus;
import com.carwash.enums.Role;
import com.carwash.service.AuthService;
import com.carwash.service.BookingService;
import com.carwash.service.LoyaltyService;
import com.carwash.service.MachineService;
import com.carwash.entity.User;
import com.carwash.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final BookingService bookingService;
    private final LoyaltyService loyaltyService;
    private final MachineService machineService;
    private final UserRepository userRepository;

    // ===== Booking Management =====

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings() {
        List<BookingResponse> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @GetMapping("/bookings/paged")
    public ResponseEntity<ApiResponse<PageResponse<BookingResponse>>> getAllBookingsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<BookingResponse> bookings = bookingService.getAllBookingsPaged(pageable);
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @PatchMapping("/bookings/{id}/status")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status) {
        BookingResponse booking = bookingService.updateBookingStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Booking status updated", booking));
    }

    @PatchMapping("/bookings/{id}/payment-status")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingPaymentStatus(
            @PathVariable Long id,
            @RequestParam PaymentStatus status) {
        BookingResponse booking = bookingService.updateBookingPaymentStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Booking payment status updated", booking));
    }

    // ===== User Management =====

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = userRepository.findAll()
                .stream()
                .map(AuthService::mapToUserResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/users/customers")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllCustomers() {
        List<UserResponse> customers = userRepository.findByRole(Role.ROLE_CUSTOMER)
                .stream()
                .map(AuthService::mapToUserResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(customers));
    }

    // ===== Loyalty Management =====

    @PatchMapping("/users/{userId}/points")
    public ResponseEntity<ApiResponse<LoyaltyResponse>> updateUserPoints(
            @PathVariable Long userId,
            @RequestParam int points) {
        LoyaltyResponse response = loyaltyService.adminUpdatePoints(userId, points);
        return ResponseEntity.ok(ApiResponse.success("Loyalty points updated", response));
    }

    // ===== Machine Management =====

    @GetMapping("/machines")
    public ResponseEntity<ApiResponse<List<MachineStatusResponse>>> getAllMachines() {
        List<MachineStatusResponse> machines = machineService.getAllMachines();
        return ResponseEntity.ok(ApiResponse.success(machines));
    }

    @PatchMapping("/machines/status")
    public ResponseEntity<ApiResponse<MachineStatusResponse>> updateMachineStatus(
            @Valid @RequestBody MachineStatusRequest request) {
        MachineStatusResponse machine = machineService.updateMachineStatus(request);
        return ResponseEntity.ok(ApiResponse.success("Machine status updated", machine));
    }

    // ===== Service Package Management =====

    @GetMapping("/services")
    public ResponseEntity<ApiResponse<List<ServicePackageResponse>>> getAllServices() {
        List<ServicePackageResponse> services = bookingService.getAllServicePackages();
        return ResponseEntity.ok(ApiResponse.success(services));
    }
}
