package com.carwash.controller;
import com.carwash.dto.request.BookingRequest;
import com.carwash.dto.response.ApiResponse;
import com.carwash.dto.response.BookingResponse;
import com.carwash.dto.response.TimeSlotResponse;
import com.carwash.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.carwash.enums.VehicleType;
import com.carwash.service.AIPricingService;
import java.time.LocalDate;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.carwash.dto.response.PageResponse;
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final AIPricingService aiPricingService;


    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            Authentication authentication,
            @Valid @RequestBody BookingRequest request) {
        BookingResponse booking = bookingService.createBooking(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Booking created successfully", booking));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings(Authentication authentication) {
        List<BookingResponse> bookings = bookingService.getUserBookings(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @GetMapping("/paged")
    public ResponseEntity<ApiResponse<PageResponse<BookingResponse>>> getMyBookingsPaged(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<BookingResponse> bookings = bookingService.getUserBookingsPaged(authentication.getName(), pageable);
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(
            @PathVariable Long id,
            Authentication authentication) {
        BookingResponse booking = bookingService.getBookingById(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(booking));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Long id,
            Authentication authentication) {
        BookingResponse booking = bookingService.cancelBooking(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", booking));
    }

    @GetMapping("/slots")
    public ResponseEntity<ApiResponse<List<TimeSlotResponse>>> getAvailableSlots(@RequestParam String date) {
        List<TimeSlotResponse> slots = bookingService.getAvailableSlots(date);
        return ResponseEntity.ok(ApiResponse.success(slots));
    }
    /**
     * 🤖 Preview giá với AI (không cần đăng nhập).
     * React gọi endpoint này mỗi khi user chọn giờ.
     */
    @PostMapping("/preview-price")
    public ResponseEntity<Map<String, Object>> previewPrice(
            @RequestBody PreviewPriceRequest request) {
        try {
            // Parse dữ liệu
            VehicleType vehicleType = VehicleType.valueOf(request.getVehicleType());
            LocalDate bookingDate = LocalDate.parse(request.getBookingDate());

            // Gọi AI lấy hệ số
            double multiplier = aiPricingService.getPriceMultiplier(
                    vehicleType,
                    request.getTimeSlot(),
                    bookingDate
            );

            // Tính giá cuối
            long finalPrice = Math.round(request.getBasePrice() * multiplier);

            System.out.println("📡 Preview: " + vehicleType + " | " + request.getTimeSlot()
                    + " | " + bookingDate + " -> " + finalPrice + "đ");

            return ResponseEntity.ok(Map.of(
                    "multiplier", multiplier,
                    "basePrice", request.getBasePrice(),
                    "finalPrice", finalPrice,
                    "currency", "VND"
            ));

        } catch (Exception e) {
            System.err.println(" Preview error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    // DTO cho request body
    @lombok.Data
    public static class PreviewPriceRequest {
        private String vehicleType;
        private String timeSlot;
        private String bookingDate;
        private double basePrice;
    }
}
