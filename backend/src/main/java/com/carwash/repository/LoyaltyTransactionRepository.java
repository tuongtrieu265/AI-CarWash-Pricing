package com.carwash.repository;
import com.carwash.entity.LoyaltyTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
//Cung cấp các phương thức truy vấn dữ liệu từ bảng loyalty_transaction
@Repository
public interface LoyaltyTransactionRepository extends JpaRepository<LoyaltyTransaction, Long> {

    List<LoyaltyTransaction> findByUserId(Long userId);

    List<LoyaltyTransaction> findByUserIdAndType(Long userId, String type);

    @Query("SELECT t FROM LoyaltyTransaction t WHERE t.createdAt < :date AND t.type = :type")
    List<LoyaltyTransaction> findByCreatedAtBeforeAndType(
            @Param("date") LocalDateTime date,
            @Param("type") String type
    );
}