package com.carwash.service;

import com.carwash.dto.response.LoyaltyResponse;
import com.carwash.entity.User;
import com.carwash.entity.LoyaltyConfig;
import com.carwash.dto.response.TierInfoResponse;
import com.carwash.enums.LoyaltyTier;
import com.carwash.exception.BadRequestException;
import com.carwash.exception.ResourceNotFoundException;
import com.carwash.repository.BookingRepository;
import com.carwash.repository.UserRepository;
import com.carwash.repository.LoyaltyConfigRepository;
import com.carwash.repository.LoyaltyTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
@Service
@RequiredArgsConstructor
public class LoyaltyService implements ILoyaltyService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final AdminTierConfigService tierConfigService;
    private final LoyaltyTransactionRepository transactionRepository;

    // Tier thresholds
    private static final int SILVER_THRESHOLD = 500;
    private static final int GOLD_THRESHOLD = 1500;
    private static final int PLATINUM_THRESHOLD = 3000;

    @Transactional
    public void awardPoints(Long userId, int points) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setLoyaltyPoints(user.getLoyaltyPoints() + points);
        user.setLoyaltyTier(calculateTier(user.getLoyaltyPoints()));
        userRepository.save(user);
    }

    public LoyaltyResponse getLoyaltyProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        long totalWashes = bookingRepository.countCompletedBookingsByUserId(user.getId());
        LoyaltyTier currentTier = user.getLoyaltyTier();
        LoyaltyTier nextTier = getNextTier(currentTier);
        int pointsToNext = calculatePointsToNextTier(user.getLoyaltyPoints(), currentTier);

        return LoyaltyResponse.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .totalPoints(user.getLoyaltyPoints())
                .currentTier(currentTier)
                .nextTier(nextTier)
                .pointsToNextTier(pointsToNext)
                .totalWashes((int) totalWashes)
                .redeemablePoints(user.getLoyaltyPoints())
                .build();
    }

    @Transactional
    public LoyaltyResponse adminUpdatePoints(Long userId, int points) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setLoyaltyPoints(points);
        user.setLoyaltyTier(calculateTier(points));
        userRepository.save(user);

        long totalWashes = bookingRepository.countCompletedBookingsByUserId(userId);
        LoyaltyTier nextTier = getNextTier(user.getLoyaltyTier());

        return LoyaltyResponse.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .totalPoints(user.getLoyaltyPoints())
                .currentTier(user.getLoyaltyTier())
                .nextTier(nextTier)
                .pointsToNextTier(calculatePointsToNextTier(user.getLoyaltyPoints(), user.getLoyaltyTier()))
                .totalWashes((int) totalWashes)
                .redeemablePoints(user.getLoyaltyPoints())
                .build();
    }

    private LoyaltyTier calculateTier(int points) {
        if (points >= PLATINUM_THRESHOLD) return LoyaltyTier.PLATINUM;
        if (points >= GOLD_THRESHOLD) return LoyaltyTier.GOLD;
        if (points >= SILVER_THRESHOLD) return LoyaltyTier.SILVER;
        return LoyaltyTier.BRONZE;
    }

    private LoyaltyTier getNextTier(LoyaltyTier currentTier) {
        return switch (currentTier) {
            case BRONZE -> LoyaltyTier.SILVER;
            case SILVER -> LoyaltyTier.GOLD;
            case GOLD -> LoyaltyTier.PLATINUM;
            case PLATINUM -> null; // Max tier
        };
    }

    private int calculatePointsToNextTier(int currentPoints, LoyaltyTier currentTier) {
        return switch (currentTier) {
            case BRONZE -> SILVER_THRESHOLD - currentPoints;
            case SILVER -> GOLD_THRESHOLD - currentPoints;
            case GOLD -> PLATINUM_THRESHOLD - currentPoints;
            case PLATINUM -> 0; // Already max
        };
    }

    @Autowired
    private LoyaltyConfigRepository configRepository;

    public LoyaltyConfig getTierConfig(LoyaltyTier tier) {
        return configRepository.findByTier(tier.name())
                .orElseThrow(() -> new ResourceNotFoundException("Tier config not found for " + tier));
    }

    @Override
    @Transactional
    public void redeemPoints(String email, int pointsToRedeem, Long rewardId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (user.getLoyaltyPoints() < pointsToRedeem) {
            throw new BadRequestException("Điểm tích lũy không đủ. Bạn chỉ có " + user.getLoyaltyPoints() + " điểm.");
        }

        user.setLoyaltyPoints(user.getLoyaltyPoints() - pointsToRedeem);
        user.setLoyaltyTier(calculateTier(user.getLoyaltyPoints()));
        userRepository.save(user);
    }

    @Override
    public List<TierInfoResponse> getAllTiers() {
        return List.of(
                TierInfoResponse.builder()
                        .name("BRONZE")
                        .minPoints(0)
                        .benefits(List.of("5% giảm giá", "Tích điểm đổi quà"))
                        .build(),
                TierInfoResponse.builder()
                        .name("SILVER")
                        .minPoints(500)
                        .benefits(List.of("10% giảm giá", "Đặt lịch trước 10 ngày", "Ưu tiên nhẹ"))
                        .build(),
                TierInfoResponse.builder()
                        .name("GOLD")
                        .minPoints(1500)
                        .benefits(List.of("15% giảm giá", "Đặt lịch trước 12 ngày", "Ưu tiên cao", "Free nước uống"))
                        .build(),
                TierInfoResponse.builder()
                        .name("PLATINUM")
                        .minPoints(3000)
                        .benefits(List.of("20% giảm giá", "Đặt lịch trước 14 ngày", "Ưu tiên cao nhất", "Free rửa xe"))
                        .build()
        );
    }

    @Override
    public List<String> getPerksByTier(LoyaltyTier tier) {
        switch (tier) {
            case PLATINUM:
                return List.of("20% giảm giá", "Free rửa xe", "Ưu tiên cao nhất");
            case GOLD:
                return List.of("15% giảm giá", "Ưu tiên cao", "Free nước uống");
            case SILVER:
                return List.of("10% giảm giá", "Đặt lịch trước 10 ngày");
            default:
                return List.of("5% giảm giá", "Tích điểm đổi quà");
        }
    }

    @Override
    public int getMaxBookingDays(LoyaltyTier tier) {
        LoyaltyConfig config = getTierConfig(tier);
        return config.getBookingWindowDays();
    }

    @Override
    public int getQueuePriority(LoyaltyTier tier) {
        LoyaltyConfig config = getTierConfig(tier);
        return config.getPriority();
    }

    @Override
    public int getDiscountPercent(LoyaltyTier tier) {
        LoyaltyConfig config = getTierConfig(tier);
        return config.getDiscountPercent();
    }
}
