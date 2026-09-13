package com.carwash.service;

import com.carwash.dto.request.PromotionRequest;
import com.carwash.dto.response.PromotionResponse;
import com.carwash.entity.Promotion;
import com.carwash.exception.ResourceNotFoundException;
import com.carwash.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final AdminNotifier adminNotifier;

    public List<PromotionResponse> getAllPromotions() {
        return promotionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PromotionResponse createPromotion(PromotionRequest request) {
        Promotion promotion = Promotion.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .code(request.getCode())
                .discountPercentage(request.getDiscountPercentage())
                .minTierTarget(request.getMinTierTarget())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        promotion = promotionRepository.save(promotion);
        return mapToResponse(promotion);
    }

    public int sendPromotion(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion", "id", id));
        
        return adminNotifier.notifyEligibleCustomers(promotion);
    }

    private PromotionResponse mapToResponse(Promotion promotion) {
        return PromotionResponse.builder()
                .id(promotion.getId())
                .title(promotion.getTitle())
                .description(promotion.getDescription())
                .code(promotion.getCode())
                .discountPercentage(promotion.getDiscountPercentage())
                .minTierTarget(promotion.getMinTierTarget())
                .startDate(promotion.getStartDate())
                .endDate(promotion.getEndDate())
                .isActive(promotion.getIsActive())
                .createdAt(promotion.getCreatedAt())
                .build();
    }
}
