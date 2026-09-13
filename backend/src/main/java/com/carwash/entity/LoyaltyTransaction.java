package com.carwash.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;


//Lưu lịch sử giao dịch điểm của khách hàng
@Entity
@Table(name = "loyalty_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "points", nullable = false)
    private Integer points;

    @Column(name = "type", nullable = false, length = 20)
    private String type; // EARNED, REDEEMED, EXPIRED

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;
}