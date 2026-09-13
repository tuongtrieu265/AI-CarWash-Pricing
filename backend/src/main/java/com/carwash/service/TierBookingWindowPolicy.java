package com.carwash.service;

import com.carwash.enums.LoyaltyTier;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
public class TierBookingWindowPolicy {

    // check if customer can book in advance
    public boolean canBookAdvance(LoyaltyTier tier, LocalDate bookingDate) {
        long daysInAdvance = ChronoUnit.DAYS.between(LocalDate.now(), bookingDate);
        
        int maxDaysAllowed = switch (tier) {
            case BRONZE -> 7;
            case SILVER -> 10;
            case GOLD -> 12;
            case PLATINUM -> 14;
            default -> 7;
        };

        return daysInAdvance <= maxDaysAllowed;
    }
}
