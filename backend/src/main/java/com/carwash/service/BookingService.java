package com.carwash.service;
import com.carwash.dto.request.BookingRequest;
import com.carwash.dto.response.BookingResponse;
import com.carwash.dto.response.ServicePackageResponse;
import com.carwash.dto.response.TimeSlotResponse;
import com.carwash.entity.Booking;
import com.carwash.entity.ServicePackage;
import com.carwash.entity.User;
import com.carwash.enums.BookingStatus;
import com.carwash.enums.PaymentStatus;
import com.carwash.exception.BadRequestException;
import com.carwash.exception.ResourceNotFoundException;
import com.carwash.repository.BookingRepository;
import com.carwash.repository.ServicePackageRepository;
import com.carwash.repository.UserRepository;
import com.carwash.config.NotificationWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.carwash.dto.response.PageResponse;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ServicePackageRepository servicePackageRepository;
    private final UserRepository userRepository;
    private final LoyaltyService loyaltyService;
    private final AIPricingService aiPricingService;

    // Maximum concurrent bookings per time slot
    private static final int MAX_BOOKINGS_PER_SLOT = 3;

    private static final BigDecimal DISCOUNT_SCALE = new BigDecimal("100");

    // Available time slots (8 AM to 6 PM, hourly)
    private static final List<String> TIME_SLOTS = List.of(
            "08:00", "09:00", "10:00", "11:00", "12:00",
            "13:00", "14:00", "15:00", "16:00", "17:00"
    );

    @Transactional
    public BookingResponse createBooking(String userEmail, BookingRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        ServicePackage servicePackage = servicePackageRepository.findById(request.getServicePackageId())
                .orElseThrow(() -> new ResourceNotFoundException("ServicePackage", "id", request.getServicePackageId()));

        if (!servicePackage.getActive()) {
            throw new BadRequestException("Gói dịch vụ này hiện không còn hoạt động.");
        }

        LocalDate bookingDate;
        try {
            bookingDate = LocalDate.parse(request.getBookingDate());
        } catch (DateTimeParseException e) {
            throw new BadRequestException("Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD");
        }

        // Giới hạn lượt đặt một người trong một ngày chỉ được đặt 1 lần (Cho phép đặt thêm nếu tất cả đơn trong ngày đã thanh toán)
        List<Booking> userBookingsToday = bookingRepository.findByUserIdAndBookingDateAndStatusNot(
                user.getId(), bookingDate, BookingStatus.CANCELLED
        );
        if (!userBookingsToday.isEmpty()) {
            boolean hasUnpaidBooking = userBookingsToday.stream()
                    .anyMatch(b -> b.getPaymentStatus() != com.carwash.enums.PaymentStatus.PAID);
            if (hasUnpaidBooking) {
                throw new BadRequestException("Bạn đã có một lịch đặt chưa thanh toán trong ngày này. Vui lòng hoàn tất thanh toán để có thể tiếp tục đặt lịch.");
            }
        }

        /*// ===== Tính năng tier-based booking window( giới hạn ngày đặt trước) =====
        int maxDays = loyaltyService.getMaxBookingDays(user.getLoyaltyTier());
        if (bookingDate.isAfter(LocalDate.now().plusDays(maxDays))) {
            throw new BadRequestException(
                    "Hạng thành viên của bạn không cho phép đặt lịch trước quá xa. Tối đa cho phép: " + maxDays + " ngày"
            );
        }

        if (bookingDate.isBefore(LocalDate.now())) {
            throw new BadRequestException("Không thể đặt lịch cho ngày trong quá khứ");
        }

        if (!TIME_SLOTS.contains(request.getTimeSlot())) {
            throw new BadRequestException("Khung giờ không hợp lệ. Các khung giờ có sẵn: " + TIME_SLOTS);
        }

        // Check slot availability
        List<Booking> existingBookings = bookingRepository
                .findByBookingDateAndTimeSlot(bookingDate, request.getTimeSlot());
        long activeBookings = existingBookings.stream()
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
                .count();

        if (activeBookings >= MAX_BOOKINGS_PER_SLOT) {
            throw new BadRequestException("Khung giờ này đã được đặt đầy. Vui lòng chọn khung giờ khác.");
        }

        // ===== Tính năng auto-apply perks( tự động giảm giá theo hạng) =====
        int discountPercent = loyaltyService.getDiscountPercent(user.getLoyaltyTier());
        BigDecimal tierDiscount = servicePackage.getPrice()
                .multiply(BigDecimal.valueOf(discountPercent))
                .divide(DISCOUNT_SCALE, java.math.RoundingMode.HALF_UP);

        // Calculate discount from redeemed points
        BigDecimal discountApplied = BigDecimal.ZERO;
        int pointsRedeemed = 0;
        if (request.getRedeemPoints() > 0) {
            if (request.getRedeemPoints() > user.getLoyaltyPoints()) {
                throw new BadRequestException("Điểm tích lũy không đủ. Bạn chỉ có " + user.getLoyaltyPoints() + " điểm.");
            }
            pointsRedeemed = request.getRedeemPoints();
            // 100 points = $1 discount
            discountApplied = BigDecimal.valueOf(pointsRedeemed / 100.0);
            if (discountApplied.compareTo(servicePackage.getPrice()) > 0) {
                discountApplied = servicePackage.getPrice();
                pointsRedeemed = servicePackage.getPrice().multiply(BigDecimal.valueOf(100)).intValue();
            }
        }

        // Final price: base price - tier discount - points discount
        BigDecimal finalPrice = servicePackage.getPrice()
                .subtract(tierDiscount)
                .subtract(discountApplied);
        if (finalPrice.compareTo(BigDecimal.ZERO) < 0) {
            finalPrice = BigDecimal.ZERO;
        }//*/



        // ===== 🤖 GỌI AI ĐỂ TÍNH HỆ SỐ GIÁ =====
        double aiMultiplier = aiPricingService.getPriceMultiplier(
                request.getVehicleType(),
                request.getTimeSlot(),
                bookingDate
        );

        // Giá cơ bản sau khi nhân hệ số AI
        BigDecimal basePriceWithAI = servicePackage.getPrice()
                .multiply(BigDecimal.valueOf(aiMultiplier))
                .setScale(0, java.math.RoundingMode.HALF_UP);

        System.out.println("💰 Base price: " + servicePackage.getPrice()
                + " × AI multiplier " + aiMultiplier
                + " = " + basePriceWithAI);

        // ===== Tính năng auto-apply perks( tự động giảm giá theo hạng) =====
        int discountPercent = loyaltyService.getDiscountPercent(user.getLoyaltyTier());
        BigDecimal tierDiscount = basePriceWithAI
                .multiply(BigDecimal.valueOf(discountPercent))
                .divide(DISCOUNT_SCALE, java.math.RoundingMode.HALF_UP);

        // Calculate discount from redeemed points
        BigDecimal discountApplied = BigDecimal.ZERO;
        int pointsRedeemed = 0;
        if (request.getRedeemPoints() > 0) {
            if (request.getRedeemPoints() > user.getLoyaltyPoints()) {
                throw new BadRequestException("Điểm tích lũy không đủ. Bạn chỉ có " + user.getLoyaltyPoints() + " điểm.");
            }
            pointsRedeemed = request.getRedeemPoints();
            // 100 points = $1 discount
            discountApplied = BigDecimal.valueOf(pointsRedeemed / 100.0);
            if (discountApplied.compareTo(basePriceWithAI) > 0) {
                discountApplied = basePriceWithAI;
                pointsRedeemed = basePriceWithAI.multiply(BigDecimal.valueOf(100)).intValue();
            }
        }

        // Final price: AI-adjusted base price - tier discount - points discount
        BigDecimal finalPrice = basePriceWithAI
                .subtract(tierDiscount)
                .subtract(discountApplied);
        if (finalPrice.compareTo(BigDecimal.ZERO) < 0) {
            finalPrice = BigDecimal.ZERO;
        }

        // ===== Tính năng lấy độ ưu tiên theo hạng =====
        int priority = loyaltyService.getQueuePriority(user.getLoyaltyTier());
        int queuePriority = priority;

        // ===== Quyền lợi áp dụng =====
        List<String> appliedPerks = new ArrayList<>(loyaltyService.getPerksByTier(user.getLoyaltyTier()));

        Booking booking = Booking.builder()
                .user(user)
                .servicePackage(servicePackage)
                .bookingDate(bookingDate)
                .timeSlot(request.getTimeSlot())
                .licensePlate(request.getLicensePlate())
                .vehicleType(request.getVehicleType())
                .notes(request.getNotes())
                .totalCost(request.getTotalCost() != null ? request.getTotalCost() : finalPrice)
                .addOnIds(request.getAddOnIds() != null ? request.getAddOnIds() : new ArrayList<>())
                .status(BookingStatus.PENDING)
                .pointsEarned(0)
                .pointsRedeemed(pointsRedeemed)
                .discountApplied(discountApplied.add(tierDiscount))
                .queuePriority(queuePriority)
                .priority(priority)
                .appliedPerks(appliedPerks)
                .build();

        booking = bookingRepository.save(booking);

        // Deduct redeemed points
        if (pointsRedeemed > 0) {
            user.setLoyaltyPoints(user.getLoyaltyPoints() - pointsRedeemed);
            userRepository.save(user);
        }

        // Broadcast real-time websocket notification for new booking
        NotificationWebSocketHandler.broadcast("NEW_BOOKING");

        return mapToBookingResponse(booking);
    }

    public List<BookingResponse> getUserBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        return bookingRepository.findByUserIdAndStatusNotOrderByBookingDateDesc(user.getId(), BookingStatus.CANCELLED)
                .stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    public PageResponse<BookingResponse> getUserBookingsPaged(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Page<Booking> page = bookingRepository.findByUserIdAndStatusNotOrderByBookingDateDesc(user.getId(), BookingStatus.CANCELLED, pageable);
        return PageResponse.of(page.map(this::mapToBookingResponse));
    }

    public BookingResponse getBookingById(Long id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new BadRequestException("Bạn không có quyền truy cập vào lịch đặt này");
        }

        return mapToBookingResponse(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(Long id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new BadRequestException("Bạn không có quyền truy cập vào lịch đặt này");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Không thể hủy lịch đặt đã hoàn thành");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Lịch đặt này đã được hủy trước đó");
        }

        booking.setStatus(BookingStatus.CANCELLED);

        // Refund redeemed points
        if (booking.getPointsRedeemed() > 0) {
            User user = booking.getUser();
            user.setLoyaltyPoints(user.getLoyaltyPoints() + booking.getPointsRedeemed());
            userRepository.save(user);
        }

        booking = bookingRepository.save(booking);

        // Broadcast real-time websocket notification for cancelled booking
        NotificationWebSocketHandler.broadcast("CANCEL_BOOKING");

        return mapToBookingResponse(booking);
    }

    public List<TimeSlotResponse> getAvailableSlots(String dateStr) {
        LocalDate date;
        try {
            date = LocalDate.parse(dateStr);
        } catch (DateTimeParseException e) {
            throw new BadRequestException("Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD");
        }

        List<Booking> bookingsOnDate = bookingRepository.findActiveBookingsByDate(date);

        return TIME_SLOTS.stream().map(slot -> {
            long bookedCount = bookingsOnDate.stream()
                    .filter(b -> b.getTimeSlot().equals(slot))
                    .count();
            return TimeSlotResponse.builder()
                    .time(slot)
                    .available(bookedCount < MAX_BOOKINGS_PER_SLOT)
                    .build();
        }).collect(Collectors.toList());
    }

    // ===== Admin Methods =====

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAllOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    public PageResponse<BookingResponse> getAllBookingsPaged(Pageable pageable) {
        Page<Booking> page = bookingRepository.findAllPaged(pageable);
        return PageResponse.of(page.map(this::mapToBookingResponse));
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long id, BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(status);

        // Award points when booking is completed
        if (status == BookingStatus.COMPLETED && oldStatus != BookingStatus.COMPLETED) {
            int pointsEarned = booking.getServicePackage().getPointsEarned();
            booking.setPointsEarned(pointsEarned);
            loyaltyService.awardPoints(booking.getUser().getId(), pointsEarned);
        }

        booking = bookingRepository.save(booking);

        // Broadcast websocket notification for status update
        NotificationWebSocketHandler.broadcast("UPDATE_BOOKING");

        return mapToBookingResponse(booking);
    }

    @Transactional
    public BookingResponse updateBookingPaymentStatus(Long id, PaymentStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        PaymentStatus oldPaymentStatus = booking.getPaymentStatus();
        booking.setPaymentStatus(status);

        // Award points when payment status is changed to PAID and points have not been awarded yet
        if (status == PaymentStatus.PAID && oldPaymentStatus != PaymentStatus.PAID) {
            if (booking.getPointsEarned() == null || booking.getPointsEarned() == 0) {
                int pointsEarned = booking.getServicePackage().getPointsEarned();
                booking.setPointsEarned(pointsEarned);
                loyaltyService.awardPoints(booking.getUser().getId(), pointsEarned);
            }
        }

        booking = bookingRepository.save(booking);

        // Broadcast real-time websocket notification for updated booking
        NotificationWebSocketHandler.broadcast("UPDATE_BOOKING");

        return mapToBookingResponse(booking);
    }

    // ===== Service Package Methods =====

    public List<ServicePackageResponse> getActiveServicePackages() {
        return servicePackageRepository.findByActiveTrue()
                .stream()
                .map(this::mapToServicePackageResponse)
                .collect(Collectors.toList());
    }

    public List<ServicePackageResponse> getAllServicePackages() {
        return servicePackageRepository.findAll()
                .stream()
                .map(this::mapToServicePackageResponse)
                .collect(Collectors.toList());
    }

    // ===== Mappers =====

    private BookingResponse mapToBookingResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .user(AuthService.mapToUserResponse(booking.getUser()))
                .servicePackage(mapToServicePackageResponse(booking.getServicePackage()))
                .bookingDate(booking.getBookingDate().toString())
                .timeSlot(booking.getTimeSlot())
                .status(booking.getStatus())
                .pointsEarned(booking.getPointsEarned())
                .pointsRedeemed(booking.getPointsRedeemed())
                .discountApplied(booking.getDiscountApplied())
                .createdAt(booking.getCreatedAt() != null ? booking.getCreatedAt().toString() : null)
                .licensePlate(booking.getLicensePlate())
                .vehicleType(booking.getVehicleType())
                .notes(booking.getNotes())
                .totalCost(booking.getTotalCost())
                .addOnIds(booking.getAddOnIds())
                .paymentMethod(booking.getPaymentMethod())
                .paymentStatus(booking.getPaymentStatus())
                .build();
    }

    private ServicePackageResponse mapToServicePackageResponse(ServicePackage sp) {
        return ServicePackageResponse.builder()
                .id(sp.getId())
                .name(sp.getName())
                .description(sp.getDescription())
                .price(sp.getPrice())
                .durationMinutes(sp.getDurationMinutes())
                .pointsEarned(sp.getPointsEarned())
                .active(sp.getActive())
                .build();
    }
}
