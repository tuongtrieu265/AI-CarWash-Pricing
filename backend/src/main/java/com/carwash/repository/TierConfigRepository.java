package com.carwash.repository;

import com.carwash.entity.TierConfig;
import com.carwash.enums.LoyaltyTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TierConfigRepository extends JpaRepository<TierConfig, Long> {
    Optional<TierConfig> findByTier(LoyaltyTier tier);
}
