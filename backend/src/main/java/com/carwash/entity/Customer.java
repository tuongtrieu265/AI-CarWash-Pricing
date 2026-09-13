package com.carwash.entity;
import jakarta.persistence.*;
import lombok.*;
@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 100)
    private String name;
    @Column(unique = true, length = 20)
    private String phone;
    @Column(name = "license_plate", unique = true, length = 20)
    private String licensePlate;
    // 1-1 với User
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @org.hibernate.annotations.CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private java.time.LocalDateTime createdAt;
}
