package com.carwash.service;

import com.carwash.dto.request.VehicleRequest;
import com.carwash.dto.response.VehicleResponse;
import com.carwash.entity.User;
import com.carwash.entity.Vehicle;
import com.carwash.exception.BadRequestException;
import com.carwash.exception.ResourceNotFoundException;
import com.carwash.mapper.VehicleMapper;
import com.carwash.repository.UserRepository;
import com.carwash.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final VehicleMapper vehicleMapper;

    @Transactional(readOnly = true)
    public List<VehicleResponse> getCustomerVehicles(String email) {
        User user = getUserByEmail(email);
        return vehicleRepository.findByUserId(user.getId())
                .stream()
                .map(vehicleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public VehicleResponse addVehicle(String email, VehicleRequest request) {
        User user = getUserByEmail(email);
        
        // Prevent adding more than 10 vehicles (optional limit to prevent abuse)
        List<Vehicle> existingVehicles = vehicleRepository.findByUserId(user.getId());
        if (existingVehicles.size() >= 10) {
            throw new BadRequestException("You cannot have more than 10 vehicles.");
        }

        Vehicle vehicle = vehicleMapper.toEntity(request);
        vehicle.setUser(user);
        
        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return vehicleMapper.toResponse(savedVehicle);
    }

    @Transactional
    public VehicleResponse updateVehicle(String email, Long vehicleId, VehicleRequest request) {
        User user = getUserByEmail(email);
        Vehicle vehicle = getVehicleByIdAndUser(vehicleId, user.getId());
        
        vehicleMapper.updateEntity(request, vehicle);
        Vehicle updatedVehicle = vehicleRepository.save(vehicle);
        
        return vehicleMapper.toResponse(updatedVehicle);
    }

    @Transactional
    public void deleteVehicle(String email, Long vehicleId) {
        User user = getUserByEmail(email);
        Vehicle vehicle = getVehicleByIdAndUser(vehicleId, user.getId());
        vehicleRepository.delete(vehicle);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private Vehicle getVehicleByIdAndUser(Long vehicleId, Long userId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", String.valueOf(vehicleId)));
        
        if (!vehicle.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not have permission to access this vehicle.");
        }
        return vehicle;
    }
}
