package com.carwash.service;

import com.carwash.entity.Promotion;
import com.carwash.entity.User;
import com.carwash.enums.LoyaltyTier;
import com.carwash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminNotifier {

    private final UserRepository userRepository;

    public int notifyEligibleCustomers(Promotion promotion) {
        LoyaltyTier minTier = promotion.getMinTierTarget();
        List<LoyaltyTier> targetTiers = getEligibleTiers(minTier);
        
        List<User> eligibleUsers = userRepository.findByLoyaltyTierIn(targetTiers);
        
        // Giả lập việc gửi email/thông báo
        for (User user : eligibleUsers) {
            log.info("Sending promotion {} to user {} (Email: {}, Tier: {})", 
                    promotion.getCode(), user.getFullName(), user.getEmail(), user.getLoyaltyTier());
        }
        
        return eligibleUsers.size();
    }
    
    private List<LoyaltyTier> getEligibleTiers(LoyaltyTier minTier) {
        List<LoyaltyTier> eligible = new ArrayList<>();
        switch (minTier) {
            case BRONZE:
                eligible.add(LoyaltyTier.BRONZE);
                eligible.add(LoyaltyTier.SILVER);
                eligible.add(LoyaltyTier.GOLD);
                break;
            case SILVER:
                eligible.add(LoyaltyTier.SILVER);
                eligible.add(LoyaltyTier.GOLD);
                break;
            case GOLD:
                eligible.add(LoyaltyTier.GOLD);
                break;
        }
        return eligible;
    }
}
