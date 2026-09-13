package com.carwash.entity;

import com.carwash.enums.LoyaltyTier;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tier_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TierConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "tier", nullable = false, unique = true, length = 20)
    private LoyaltyTier tier;

    @Column(name = "min_points", nullable = false)
    private Integer minPoints;

    @Column(name = "point_rate_multiplier", nullable = false)
    @Builder.Default
    private Double pointRateMultiplier = 1.0;

    @Column(name = "perks", columnDefinition = "TEXT")
    private String perks;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
