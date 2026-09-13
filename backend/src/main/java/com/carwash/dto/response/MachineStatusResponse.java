package com.carwash.dto.response;

import com.carwash.enums.MachineState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MachineStatusResponse {
    private Long id;
    private String machineName;
    private MachineState state;
    private Long currentBookingId;
    private String lastMaintenanceDate;
    private String updatedAt;
}
