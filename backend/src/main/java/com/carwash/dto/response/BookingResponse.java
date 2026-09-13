package com.carwash.dto.response;

import com.carwash.enums.BookingStatus;
import com.carwash.enums.PaymentMethod;
import com.carwash.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import com.carwash.enums.VehicleType;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {
    private Long id;
    private UserResponse user;
    private ServicePackageResponse servicePackage;
    private String bookingDate;
    private String timeSlot;
    private BookingStatus status;
    private Integer pointsEarned;
    private Integer pointsRedeemed;
    private BigDecimal discountApplied;
    private String createdAt;
    private String licensePlate;
    private VehicleType vehicleType;
    private String notes;
    private BigDecimal totalCost;
    private List<String> addOnIds;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private String checkoutUrl;
}
