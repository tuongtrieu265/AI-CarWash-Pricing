package com.carwash.entity;

import com.carwash.enums.MachineState;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "machine_statuses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MachineStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Machine name is required")
    @Size(max = 50, message = "Machine name must not exceed 50 characters")
    @Column(name = "machine_name", nullable = false, unique = true, length = 50)
    private String machineName;

    @Enumerated(EnumType.STRING)
    @Column(name = "state", nullable = false, length = 20)
    @Builder.Default
    private MachineState state = MachineState.AVAILABLE;

    @Column(name = "current_booking_id")
    private Long currentBookingId;

    @Column(name = "last_maintenance_date")
    private LocalDate lastMaintenanceDate;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
