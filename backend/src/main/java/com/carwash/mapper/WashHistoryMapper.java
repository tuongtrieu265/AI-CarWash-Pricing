package com.carwash.mapper;
import com.carwash.dto.response.WashHistoryResponse;
import com.carwash.entity.Booking;
import org.springframework.stereotype.Component;
// Booking sang WashHistoryResponse
@Component
public class WashHistoryMapper {
    public WashHistoryResponse toResponse(Booking booking) {
        if (booking == null) {
            return null;
        }
        return WashHistoryResponse.builder()
                .id(booking.getId())
                .servicePackageName(booking.getServicePackage() != null ? booking.getServicePackage().getName() : null)
                .bookingDate(booking.getBookingDate() != null ? booking.getBookingDate().toString() : null)
                .timeSlot(booking.getTimeSlot())
                .licensePlate(booking.getLicensePlate())
                .totalCost(booking.getTotalCost())
                .status(booking.getStatus())
                .pointsEarned(booking.getPointsEarned())
                .createdAt(booking.getCreatedAt() != null ? booking.getCreatedAt().toString() : null)
                .build();
    }
}