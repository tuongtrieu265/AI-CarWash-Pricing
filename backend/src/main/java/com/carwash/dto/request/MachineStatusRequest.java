package com.carwash.dto.request;
import com.carwash.enums.MachineState;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MachineStatusRequest {

    @NotNull(message = "Machine ID is required")
    private Long machineId;

    @NotNull(message = "State is required")
    private MachineState state;

    private Long currentBookingId;
}
