package com.carwash.dto.response;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
// trả về thông tinh khách hàng
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerResponse {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String licensePlate;
}
