package com.carwash.service;

import com.carwash.enums.LoyaltyTier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TierQueuePolicyTest {

    private TierQueuePolicy policy;

    @BeforeEach
    void setUp() {
        policy = new TierQueuePolicy();
    }

    @Test
    void testCalculateQueuePriority() {
        assertEquals(1, policy.calculateQueuePriority(LoyaltyTier.BRONZE));
        assertEquals(2, policy.calculateQueuePriority(LoyaltyTier.SILVER));
        assertEquals(3, policy.calculateQueuePriority(LoyaltyTier.GOLD));
        assertEquals(4, policy.calculateQueuePriority(LoyaltyTier.PLATINUM));
    }
}
