package com.carwash.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

// Lưu cấu hình hạng thành viên
@Entity
@Table(name = "loyalty_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tier", nullable = false, length = 20)
    private String tier; // BRONZE, SILVER, GOLD, PLATINUM

    @Column(name = "min_points")
    private Integer minPoints;

    @Column(name = "min_spent", precision = 12, scale = 2)
    private BigDecimal minSpent;

    @Column(name = "min_visits")
    private Integer minVisits;

    @Column(name = "discount_percent")
    private Integer discountPercent;

    @Column(name = "booking_window_days")
    private Integer bookingWindowDays;

    @Column(name = "benefits", columnDefinition = "TEXT")
    private String benefits; // Lưu dạng JSON hoặc text

    @Column(name = "priority")
    private Integer priority; // Độ ưu tiên queue (1-4)

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}