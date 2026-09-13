package com.carwash.dto.response;

import com.carwash.enums.LoyaltyTier;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TierConfigResponse {
    private Long id;
    private LoyaltyTier tier;
    private Integer minPoints;
    private Double pointRateMultiplier;
    private String perks;
    private LocalDateTime updatedAt;
}
