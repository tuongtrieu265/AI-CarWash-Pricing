package com.carwash.service;
import com.carwash.dto.response.WashHistoryResponse;
import com.carwash.entity.User;
import com.carwash.enums.BookingStatus;
import com.carwash.exception.ResourceNotFoundException;
import com.carwash.mapper.WashHistoryMapper;
import com.carwash.repository.BookingRepository;
import com.carwash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class WashHistoryService {
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final WashHistoryMapper washHistoryMapper;
    // lấy tất cả lịch sử rửa xe
    public List<WashHistoryResponse> getCustomerWashHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return bookingRepository.findByUserIdOrderByBookingDateDesc(user.getId())
                .stream()
                .map(washHistoryMapper::toResponse)
                .collect(Collectors.toList());
    }
    // lấy lịch sử rửa xe đã xong
    public List<WashHistoryResponse> getCompletedWashHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return bookingRepository.findByUserIdAndStatus(user.getId(), BookingStatus.COMPLETED)
                .stream()
                .map(washHistoryMapper::toResponse)
                .collect(Collectors.toList());
    }
}