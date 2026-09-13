package com.carwash.dto.response;

import com.carwash.enums.LoyaltyTier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyResponse {
    private Long userId;
    private String fullName;
    private Integer totalPoints;
    private LoyaltyTier currentTier;
    private LoyaltyTier nextTier;
    private Integer pointsToNextTier;
    private Integer totalWashes;
    private Integer redeemablePoints;
}
