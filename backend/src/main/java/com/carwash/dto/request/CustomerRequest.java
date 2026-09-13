package com.carwash.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
// Yêu cầu cập nhật thông tin khách hàng
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequest {
    @NotBlank(message = "Ten khong duoc de trong")
    @Size(min = 2, max = 100, message = "Ten phai tu 2 den 100 ky tu")
    private String name;
    @NotBlank(message = "So dien thoai khong duoc de trong")
    private String phone;
    private String licensePlate;
}
