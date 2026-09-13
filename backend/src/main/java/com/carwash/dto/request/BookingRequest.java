package com.carwash.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import com.carwash.enums.VehicleType;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {

    @NotNull(message = "Service package ID is required")
    private Long servicePackageId;

    @NotBlank(message = "Booking date is required")
    private String bookingDate;

    @NotBlank(message = "Time slot is required")
    private String timeSlot;

    @Min(value = 0, message = "Redeem points cannot be negative")
    private int redeemPoints = 0;

    private String licensePlate;

    private VehicleType vehicleType;

    private String notes;

    private BigDecimal totalCost;

    private List<String> addOnIds;
}
