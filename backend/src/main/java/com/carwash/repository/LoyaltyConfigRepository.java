package com.carwash.repository;
import com.carwash.entity.LoyaltyConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;


//Cung cấp các phương thức truy vấn dữ liệu từ bảng loyalty_config
@Repository
public interface LoyaltyConfigRepository extends JpaRepository<LoyaltyConfig, Long> {
    Optional<LoyaltyConfig> findByTier(String tier);
}