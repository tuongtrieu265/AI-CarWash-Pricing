package com.carwash.dto.response;

import com.carwash.enums.LoyaltyTier;
import com.carwash.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    private Integer loyaltyPoints;
    private LoyaltyTier loyaltyTier;
    private String createdAt;
}
