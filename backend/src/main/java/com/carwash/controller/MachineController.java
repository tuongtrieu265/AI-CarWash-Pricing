package com.carwash.controller;

import com.carwash.dto.response.ApiResponse;
import com.carwash.dto.response.MachineStatusResponse;
import com.carwash.service.MachineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/machines")
@RequiredArgsConstructor
public class MachineController {

    private final MachineService machineService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MachineStatusResponse>>> getAllMachines() {
        List<MachineStatusResponse> machines = machineService.getAllMachines();
        return ResponseEntity.ok(ApiResponse.success(machines));
    }
}
