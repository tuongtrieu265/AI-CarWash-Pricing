package com.carwash.dto.response;
import com.carwash.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
// trả về lịch sử đặt lịch
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WashHistoryResponse {
    private Long id;
    private String servicePackageName;
    private String bookingDate;
    private String timeSlot;
    private String licensePlate;
    private BigDecimal totalCost;
    private BookingStatus status;
    private Integer pointsEarned;
    private String createdAt;
}
