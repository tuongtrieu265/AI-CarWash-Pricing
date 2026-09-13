package com.carwash.controller;
import com.carwash.dto.request.TierConfigRequest;
import com.carwash.dto.response.TierConfigResponse;
import com.carwash.enums.LoyaltyTier;
import com.carwash.service.AdminTierConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/tiers/config")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminTierController {

    private final AdminTierConfigService tierConfigService;

    @GetMapping
    public ResponseEntity<List<TierConfigResponse>> getAllConfigs() {
        return ResponseEntity.ok(tierConfigService.getAllConfigs());
    }

    @GetMapping("/{tier}")
    public ResponseEntity<TierConfigResponse> getConfig(@PathVariable LoyaltyTier tier) {
        return ResponseEntity.ok(tierConfigService.getConfig(tier));
    }

    @PutMapping("/{tier}")
    public ResponseEntity<TierConfigResponse> updateConfig(
            @PathVariable LoyaltyTier tier,
            @Valid @RequestBody TierConfigRequest request) {
        return ResponseEntity.ok(tierConfigService.updateConfig(tier, request));
    }
}
