package com.carwash.service;

import com.carwash.enums.LoyaltyTier;
import org.springframework.stereotype.Component;

@Component
public class TierQueuePolicy {

    // determine queue priority based on tier
    public int calculateQueuePriority(LoyaltyTier tier) {
        return switch (tier) {
            case BRONZE -> 1;
            case SILVER -> 2;
            case GOLD -> 3;
            case PLATINUM -> 4;
            default -> 0;
        };
    }
}
