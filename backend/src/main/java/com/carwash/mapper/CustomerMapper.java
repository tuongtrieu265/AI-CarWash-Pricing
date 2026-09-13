package com.carwash.mapper;
import com.carwash.dto.request.CustomerRequest;
import com.carwash.dto.response.CustomerResponse;
import com.carwash.entity.Customer;
import org.springframework.stereotype.Component;
// Mapper cho Customer và CustomerDTO
@Component
public class CustomerMapper {
    public CustomerResponse toResponse(Customer customer) {
        if (customer == null) {
            return null;
        }
        return CustomerResponse.builder()
                .id(customer.getId())
                .userId(customer.getUser() != null ? customer.getUser().getId() : null)
                .name(customer.getName())
                .email(customer.getUser() != null ? customer.getUser().getEmail() : null)
                .phone(customer.getPhone())
                .licensePlate(customer.getLicensePlate())
                .build();
    }
    public Customer toEntity(CustomerRequest request) {
        if (request == null) {
            return null;
        }
        return Customer.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .licensePlate(request.getLicensePlate())
                .build();
    }
    public void updateEntity(CustomerRequest request, Customer customer) {
        if (request == null || customer == null) {
            return;
        }
        customer.setName(request.getName());
        customer.setPhone(request.getPhone());
        customer.setLicensePlate(request.getLicensePlate());
    }
}