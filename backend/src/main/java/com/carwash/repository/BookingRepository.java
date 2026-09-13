package com.carwash.repository;

import com.carwash.entity.Booking;
import com.carwash.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdOrderByBookingDateDesc(Long userId);

    List<Booking> findByUserIdAndStatusNotOrderByBookingDateDesc(Long userId, BookingStatus status);

    List<Booking> findByUserIdAndStatus(Long userId, BookingStatus status);

    List<Booking> findByBookingDate(LocalDate bookingDate);

    List<Booking> findByBookingDateAndTimeSlot(LocalDate bookingDate, String timeSlot);

    boolean existsByUserIdAndBookingDateAndStatusNot(Long userId, LocalDate bookingDate, BookingStatus status);

    List<Booking> findByUserIdAndBookingDateAndStatusNot(Long userId, LocalDate bookingDate, BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.bookingDate = :date AND b.status NOT IN ('CANCELLED')")
    List<Booking> findActiveBookingsByDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.user.id = :userId AND b.status = 'COMPLETED'")
    long countCompletedBookingsByUserId(@Param("userId") Long userId);

    @Query("SELECT b FROM Booking b ORDER BY (CASE WHEN b.status = 'CANCELLED' THEN 1 ELSE 0 END) ASC, b.createdAt DESC")
    List<Booking> findAllOrderByCreatedAtDesc();

    // paginated queries
    Page<Booking> findByUserIdOrderByBookingDateDesc(Long userId, Pageable pageable);

    Page<Booking> findByUserIdAndStatusNotOrderByBookingDateDesc(Long userId, BookingStatus status, Pageable pageable);

    @Query("SELECT b FROM Booking b ORDER BY (CASE WHEN b.status = 'CANCELLED' THEN 1 ELSE 0 END) ASC, b.createdAt DESC")
    Page<Booking> findAllPaged(Pageable pageable);
}
