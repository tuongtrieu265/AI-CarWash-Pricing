package com.carwash.service;
import com.carwash.dto.response.LoyaltyResponse;
import com.carwash.enums.LoyaltyTier;
import com.carwash.dto.response.TierInfoResponse;

import java.util.List;

public interface ILoyaltyService {

 // Interface định nghĩa phương thức xử lý loyalty
    //Cộng điểm
    void awardPoints(Long userId, int points);

    // Xem điểm hạng
    LoyaltyResponse getLoyaltyProfile(String email);


    // Admin sửa điểm
    LoyaltyResponse adminUpdatePoints(Long userId, int points);


//-------------Tính năng mới được cập nhật trong Loyalty---------------------//

    // Đổi điểm lấy ưu đãi
    void redeemPoints(String email, int pointsToRedeem, Long rewardId);

    // Xem danh sách các hạng
    List<TierInfoResponse> getAllTiers();

//    // Lịch sử điểm của user
//    List<TransactionResponse> getUserTransactions(String email);

    // Lấy số ngày đặt trước theo tier (cho BookingService)
    int getMaxBookingDays(LoyaltyTier tier);

    // Lấy độ ưu tiên queue theo tier (cho BookingService)
    int getQueuePriority(LoyaltyTier tier);

    // Lấy % giảm giá theo tier (cho Payment)
    int getDiscountPercent(LoyaltyTier tier);

    // Điểm hết hạn sau 12 tháng( chạy tự động mỗi ngày)
    //    void expireOldPoints();

//    //Tự động nâng hạ thành viên mỗi tháng
//    void runMonthlyTierReview();

    //lấy danh sách quyền lợi(perks theo hạng)
    List<String> getPerksByTier(LoyaltyTier tier);
}