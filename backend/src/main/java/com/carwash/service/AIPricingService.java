package com.carwash.service;
import com.carwash.enums.VehicleType;
import lombok.Data;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.time.LocalDate;

@Service
public class AIPricingService {

    private static final String AI_API_URL = "http://localhost:8000/predict-price";
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Gọi AI service để lấy hệ số giá dựa trên loại xe, giờ, ngày.
     */
    public double getPriceMultiplier(VehicleType vehicleType, String timeSlot, LocalDate bookingDate) {
        try {
            // Parse timeSlot "09:00" -> hour = 9
            int hour = Integer.parseInt(timeSlot.split(":")[0]);

            // Convert DayOfWeek (Java: 1=Mon, 7=Sun) -> Python (0=Mon, 6=Sun)
            int dayOfWeek = bookingDate.getDayOfWeek().getValue() - 1;

            // Build request
            PricePredictionRequest request = new PricePredictionRequest();
            request.setCar_type(vehicleType.name());
            request.setHour(hour);
            request.setDay_of_week(dayOfWeek);

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<PricePredictionRequest> entity = new HttpEntity<>(request, headers);

            // Call AI API
            ResponseEntity<PricePredictionResponse> response = restTemplate.postForEntity(
                    AI_API_URL, entity, PricePredictionResponse.class
            );

            double multiplier = response.getBody().getMultiplier();
            System.out.println("🤖 AI predicted: " + vehicleType + " | " + timeSlot
                    + " | Thu " + (dayOfWeek + 2) + " -> multiplier = " + multiplier);

            return multiplier;

        } catch (Exception e) {
            System.err.println(" AI Service error: " + e.getMessage());
            return getFallbackMultiplier(vehicleType);
        }
    }

    /**
     * Hệ số dự phòng khi AI service không hoạt động.
     */
    private double getFallbackMultiplier(VehicleType vehicleType) {
        switch (vehicleType) {
            case XE_MAY: return 0.5;
            case SEDAN:  return 1.0;
            case SUV:    return 1.25;
            case PICKUP: return 1.4;
            default:     return 1.0;
        }
    }

    // ===== Inner DTOs =====

    @Data
    public static class PricePredictionRequest {
        private String car_type;
        private int hour;
        private int day_of_week;
    }

    @Data
    public static class PricePredictionResponse {
        private double multiplier;
        private double base_multiplier;
    }
}