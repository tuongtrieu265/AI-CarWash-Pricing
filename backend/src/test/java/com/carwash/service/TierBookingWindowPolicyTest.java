package com.carwash.service;

import com.carwash.enums.LoyaltyTier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class TierBookingWindowPolicyTest {

    private TierBookingWindowPolicy policy;

    @BeforeEach
    void setUp() {
        policy = new TierBookingWindowPolicy();
    }

    @Test
    void testBronzeTier_CanBookWithin7Days() {
        LocalDate today = LocalDate.now();
        
        // valid: 7 days
        assertTrue(policy.canBookAdvance(LoyaltyTier.BRONZE, today.plusDays(7)));
        // valid: 5 days
        assertTrue(policy.canBookAdvance(LoyaltyTier.BRONZE, today.plusDays(5)));
        
        // invalid: 8 days
        assertFalse(policy.canBookAdvance(LoyaltyTier.BRONZE, today.plusDays(8)));
    }

    @Test
    void testSilverTier_CanBookWithin10Days() {
        LocalDate today = LocalDate.now();
        
        assertTrue(policy.canBookAdvance(LoyaltyTier.SILVER, today.plusDays(10)));
        assertFalse(policy.canBookAdvance(LoyaltyTier.SILVER, today.plusDays(11)));
    }

    @Test
    void testGoldTier_CanBookWithin12Days() {
        LocalDate today = LocalDate.now();
        
        assertTrue(policy.canBookAdvance(LoyaltyTier.GOLD, today.plusDays(12)));
        assertFalse(policy.canBookAdvance(LoyaltyTier.GOLD, today.plusDays(13)));
    }

    @Test
    void testPlatinumTier_CanBookWithin14Days() {
        LocalDate today = LocalDate.now();

        assertTrue(policy.canBookAdvance(LoyaltyTier.PLATINUM, today.plusDays(14)));
        assertFalse(policy.canBookAdvance(LoyaltyTier.PLATINUM, today.plusDays(15)));
    }
}
