package com.carwash.dto.response;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;



//Đóng gói thông tin về một giao dịch điểm điểm để gửi về phía client
@Data
@Builder  // ← PHẢI CÓ @Builder
public class TransactionResponse {
    private Long id;
    private Integer points;
    private String type;
    private String description;
    private LocalDateTime createdAt;
}