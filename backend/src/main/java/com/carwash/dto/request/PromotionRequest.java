package com.carwash.dto.request;
import com.carwash.enums.LoyaltyTier;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PromotionRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Code is required")
    private String code;

    @NotNull(message = "Discount percentage is required")
    private Double discountPercentage;

    @NotNull(message = "Minimum tier target is required")
    private LoyaltyTier minTierTarget;

    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    private LocalDateTime endDate;

    private Boolean isActive;
}
