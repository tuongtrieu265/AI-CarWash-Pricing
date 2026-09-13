package com.carwash.dto.request;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
@Data
public class TierConfigRequest {
    @NotNull(message = "Minimum points cannot be null")
    @Min(value = 0, message = "Minimum points must be at least 0")
    private Integer minPoints;

    @NotNull(message = "Point rate multiplier cannot be null")
    @Min(value = 0, message = "Point rate multiplier must be at least 0")
    private Double pointRateMultiplier;

    private String perks;
}
