package com.carwash.repository;
import com.carwash.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByUserId(Long userId);
    Optional<Customer> findByUserEmail(String email);
    Optional<Customer> findByPhone(String phone);
    Optional<Customer> findByLicensePlate(String licensePlate);
}