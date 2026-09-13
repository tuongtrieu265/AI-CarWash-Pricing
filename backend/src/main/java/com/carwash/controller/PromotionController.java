package com.carwash.controller;

import com.carwash.dto.request.PromotionRequest;
import com.carwash.dto.response.PromotionResponse;
import com.carwash.service.PromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/promotions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class PromotionController {

    private final PromotionService promotionService;

    @GetMapping
    public ResponseEntity<List<PromotionResponse>> getAllPromotions() {
        return ResponseEntity.ok(promotionService.getAllPromotions());
    }

    @PostMapping
    public ResponseEntity<PromotionResponse> createPromotion(@Valid @RequestBody PromotionRequest request) {
        return ResponseEntity.ok(promotionService.createPromotion(request));
    }

    @PostMapping("/{id}/send")
    public ResponseEntity<Map<String, Object>> sendPromotion(@PathVariable Long id) {
        int count = promotionService.sendPromotion(id);
        return ResponseEntity.ok(Map.of(
                "message", "Promotion sent successfully",
                "notifiedCount", count
        ));
    }
}
