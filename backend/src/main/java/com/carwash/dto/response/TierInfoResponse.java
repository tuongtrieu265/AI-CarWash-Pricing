package com.carwash.dto.response;
import lombok.Builder;
import lombok.Data;
import java.util.List;
//Đóng gói thông tin về một hạng thành viên để gửi về cho client
@Data
@Builder
public class TierInfoResponse {
    private String name;
    private Integer minPoints;
    private List<String> benefits;
}
