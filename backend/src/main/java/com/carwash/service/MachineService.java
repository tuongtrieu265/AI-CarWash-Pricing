package com.carwash.service;

import com.carwash.dto.request.MachineStatusRequest;
import com.carwash.dto.response.MachineStatusResponse;
import com.carwash.entity.MachineStatus;
import com.carwash.exception.ResourceNotFoundException;
import com.carwash.repository.MachineStatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MachineService {

    private final MachineStatusRepository machineStatusRepository;

    public List<MachineStatusResponse> getAllMachines() {
        return machineStatusRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MachineStatusResponse updateMachineStatus(MachineStatusRequest request) {
        MachineStatus machine = machineStatusRepository.findById(request.getMachineId())
                .orElseThrow(() -> new ResourceNotFoundException("Machine", "id", request.getMachineId()));

        machine.setState(request.getState());
        machine.setCurrentBookingId(request.getCurrentBookingId());

        machine = machineStatusRepository.save(machine);
        return mapToResponse(machine);
    }

    private MachineStatusResponse mapToResponse(MachineStatus machine) {
        return MachineStatusResponse.builder()
                .id(machine.getId())
                .machineName(machine.getMachineName())
                .state(machine.getState())
                .currentBookingId(machine.getCurrentBookingId())
                .lastMaintenanceDate(machine.getLastMaintenanceDate() != null
                        ? machine.getLastMaintenanceDate().toString() : null)
                .updatedAt(machine.getUpdatedAt() != null
                        ? machine.getUpdatedAt().toString() : null)
                .build();
    }
}
