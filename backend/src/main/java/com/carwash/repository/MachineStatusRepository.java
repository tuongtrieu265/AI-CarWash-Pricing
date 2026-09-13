package com.carwash.repository;

import com.carwash.entity.MachineStatus;
import com.carwash.enums.MachineState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MachineStatusRepository extends JpaRepository<MachineStatus, Long> {

    List<MachineStatus> findByState(MachineState state);

    boolean existsByMachineName(String machineName);
}
