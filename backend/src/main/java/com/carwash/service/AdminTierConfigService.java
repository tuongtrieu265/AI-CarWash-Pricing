package com.carwash.service;

import com.carwash.dto.request.TierConfigRequest;
import com.carwash.dto.response.TierConfigResponse;
import com.carwash.entity.TierConfig;
import com.carwash.enums.LoyaltyTier;
import com.carwash.exception.ResourceNotFoundException;
import com.carwash.repository.TierConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminTierConfigService {

    private final TierConfigRepository tierConfigRepository;

    public List<TierConfigResponse> getAllConfigs() {
        return tierConfigRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TierConfigResponse getConfig(LoyaltyTier tier) {
        TierConfig config = tierConfigRepository.findByTier(tier)
                .orElseThrow(() -> new ResourceNotFoundException("TierConfig", "tier", tier.name()));
        return mapToResponse(config);
    }

    @Transactional
    public TierConfigResponse updateConfig(LoyaltyTier tier, TierConfigRequest request) {
        TierConfig config = tierConfigRepository.findByTier(tier)
                .orElse(TierConfig.builder().tier(tier).build());

        config.setMinPoints(request.getMinPoints());
        config.setPointRateMultiplier(request.getPointRateMultiplier());
        config.setPerks(request.getPerks());

        tierConfigRepository.save(config);
        return mapToResponse(config);
    }

    public int getMinPointsForTier(LoyaltyTier tier) {
        return tierConfigRepository.findByTier(tier)
                .map(TierConfig::getMinPoints)
                .orElseGet(() -> getDefaultMinPoints(tier));
    }

    private int getDefaultMinPoints(LoyaltyTier tier) {
        return switch (tier) {
            case BRONZE -> 0;
            case SILVER -> 500;
            case GOLD -> 1500;
            case PLATINUM -> 3000;
        };
    }

    private TierConfigResponse mapToResponse(TierConfig config) {
        return TierConfigResponse.builder()
                .id(config.getId())
                .tier(config.getTier())
                .minPoints(config.getMinPoints())
                .pointRateMultiplier(config.getPointRateMultiplier())
                .perks(config.getPerks())
                .updatedAt(config.getUpdatedAt())
                .build();
    }
}
