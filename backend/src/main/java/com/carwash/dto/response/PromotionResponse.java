package com.carwash.dto.response;

import com.carwash.enums.LoyaltyTier;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PromotionResponse {
    private Long id;
    private String title;
    private String description;
    private String code;
    private Double discountPercentage;
    private LoyaltyTier minTierTarget;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
