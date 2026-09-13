package com.carwash.controller;

import com.carwash.dto.response.ApiResponse;
import com.carwash.entity.Booking;
import com.carwash.enums.BookingStatus;
import com.carwash.enums.PaymentMethod;
import com.carwash.enums.PaymentStatus;
import com.carwash.exception.BadRequestException;
import com.carwash.exception.ResourceNotFoundException;
import com.carwash.repository.BookingRepository;
import com.carwash.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final BookingRepository bookingRepository;
    private final BookingService bookingService;

    @Value("${sepay.webhook-token}")
    private String sepayWebhookToken;

    @Value("${sepay.bank-id}")
    private String bankId;

    @Value("${sepay.account-no}")
    private String accountNo;

    @Value("${sepay.account-name}")
    private String accountName;

    /**
     * Xác nhận phương thức thanh toán cho một booking và trả về cấu hình chuyển khoản.
     */
    @PostMapping("/create-payment-link")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPaymentLink(
            @RequestBody Map<String, Object> request) {
        try {
            Long bookingId = Long.valueOf(request.get("bookingId").toString());
            String paymentMethodStr = request.get("paymentMethod") != null
                    ? request.get("paymentMethod").toString() : "TRANSFER";

            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

            // Lưu phương thức thanh toán
            booking.setPaymentMethod(PaymentMethod.valueOf(paymentMethodStr));
            booking.setPaymentStatus(PaymentStatus.UNPAID);
            bookingRepository.save(booking);

            log.info("Updated payment method to {} for booking #{}", paymentMethodStr, bookingId);

            if (PaymentMethod.valueOf(paymentMethodStr) == PaymentMethod.CASH) {
                return ResponseEntity.ok(ApiResponse.success("Payment method set to CASH",
                        Map.of("paymentMethod", "CASH")));
            }

            // Chuyển khoản ngân hàng (SePay)
            String description = "AUTOCLEAN" + booking.getId();
            double amount = booking.getTotalCost().doubleValue();

            // Tạo link VietQR động
            String qrUrl = String.format(
                    "https://img.vietqr.io/image/%s-%s-compact.png?amount=%.0f&addInfo=%s&accountName=%s",
                    bankId, accountNo, amount, description, accountName.replace(" ", "%20"));

            return ResponseEntity.ok(ApiResponse.success("Payment details generated",
                    Map.of(
                            "paymentMethod", "TRANSFER",
                            "bankId", bankId,
                            "accountNo", accountNo,
                            "accountName", accountName,
                            "description", description,
                            "amount", amount,
                            "qrCode", qrUrl
                    )));

        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error setting payment method: {}", e.getMessage(), e);
            throw new BadRequestException("Không thể thiết lập thanh toán: " + e.getMessage());
        }
    }

    /**
     * SePay Webhook: Nhận thông báo khi phát hiện biến động số dư chuyển khoản thành công.
     */
    @PostMapping("/sepay-webhook")
    public ResponseEntity<Map<String, Object>> handleSePayWebhook(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> body) {
        try {
            log.info("Received SePay webhook header: {}", authHeader);
            log.info("Received SePay webhook payload: {}", body);

            // Xác thực Token bảo mật (chỉ kiểm tra nếu Token cấu hình khác placeholder và không trống)
            if (sepayWebhookToken != null && !sepayWebhookToken.isEmpty() 
                    && !"YOUR_SEPAY_WEBHOOK_TOKEN".equals(sepayWebhookToken)) {
                String expectedAuth = "Apikey " + sepayWebhookToken;
                if (authHeader == null || !authHeader.equals(expectedAuth)) {
                    log.warn("Unauthorized SePay webhook call. Expected: {}, Got: {}", expectedAuth, authHeader);
                    return ResponseEntity.status(401).body(Map.of("success", false, "message", "Unauthorized"));
                }
            }

            // Lấy thông tin nội dung tin nhắn chuyển khoản
            String content = body.get("content") != null ? body.get("content").toString() : "";
            String code = body.get("code") != null ? body.get("code").toString() : "";
            String fullSearchText = (content + " " + code).toUpperCase();

            // Tìm mã đặt lịch bằng biểu thức chính quy (Regex: AUTOCLEAN[ID])
            Pattern pattern = Pattern.compile("AUTOCLEAN\\s*(\\d+)");
            Matcher matcher = pattern.matcher(fullSearchText);

            if (matcher.find()) {
                Long bookingId = Long.parseLong(matcher.group(1));
                log.info("Matched booking ID #{} from SePay webhook", bookingId);

                Booking booking = bookingRepository.findById(bookingId).orElse(null);
                if (booking != null) {
                    bookingService.updateBookingPaymentStatus(bookingId, PaymentStatus.PAID);
                    if (booking.getStatus() == BookingStatus.PENDING) {
                        bookingService.updateBookingStatus(bookingId, BookingStatus.CONFIRMED);
                    }
                    log.info("Booking #{} payment status confirmed via SePay Webhook", bookingId);
                    return ResponseEntity.ok(Map.of("success", true, "message", "Xác nhận thanh toán thành công"));
                } else {
                    log.warn("Booking #{} not found in database", bookingId);
                }
            } else {
                log.warn("No AUTOCLEAN[ID] matched in content: '{}' or code: '{}'", content, code);
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "Giao dịch không khớp mã đặt lịch"));
        } catch (Exception e) {
            log.error("Error processing SePay webhook: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of("success", true, "message", e.getMessage())); // Luôn trả về 200 để SePay không gửi lại
        }
    }
}
