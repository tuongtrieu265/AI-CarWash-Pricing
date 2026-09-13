package com.carwash.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "service_packages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServicePackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Service name is required")
    @Size(max = 50, message = "Service name must not exceed 50 characters")
    @Column(name = "name", nullable = false, unique = true, length = 50)
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    @Column(name = "description", length = 500)
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @NotNull(message = "Points earned is required")
    @Min(value = 0, message = "Points earned cannot be negative")
    @Column(name = "points_earned", nullable = false)
    private Integer pointsEarned;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    // ===== Relationships =====

    @OneToMany(mappedBy = "servicePackage", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Booking> bookings = new ArrayList<>();
}
