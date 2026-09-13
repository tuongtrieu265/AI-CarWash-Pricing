package com.carwash.service;
import com.carwash.dto.request.CustomerRequest;
import com.carwash.dto.response.CustomerResponse;
import com.carwash.entity.Customer;
import com.carwash.entity.User;
import com.carwash.exception.BadRequestException;
import com.carwash.exception.ResourceNotFoundException;
import com.carwash.mapper.CustomerMapper;
import com.carwash.repository.CustomerRepository;
import com.carwash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
@RequiredArgsConstructor
public class CustomerService {
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final CustomerMapper customerMapper;
    // lấy hồ sơ
    @Transactional
    public CustomerResponse getCustomerProfile(String email) {
        Customer customer = getOrCreateCustomer(email);
        return customerMapper.toResponse(customer);
    }
    // cập nhật hồ sơ
    @Transactional
    public CustomerResponse updateCustomerProfile(String email, CustomerRequest request) {
        Customer customer = getOrCreateCustomer(email);
        String newPhone = (request.getPhone() != null && !request.getPhone().trim().isEmpty()) ? request.getPhone().trim() : null;
        String newPlate = (request.getLicensePlate() != null && !request.getLicensePlate().trim().isEmpty()) ? request.getLicensePlate().trim() : null;
        if (newPhone != null) {
            customerRepository.findByPhone(newPhone)
                .ifPresent(existing -> {
                    if (!existing.getId().equals(customer.getId())) {
                        throw new BadRequestException("So dien thoai da duoc su dung boi tai khoan khac");
                    }
                });
        }
        // Kiểm tra trùng biển số xe
        if (newPlate != null) {
            customerRepository.findByLicensePlate(newPlate)
                .ifPresent(existing -> {
                    if (!existing.getId().equals(customer.getId())) {
                        throw new BadRequestException("Bien so xe da duoc su dung boi tai khoan khac");
                    }
                });
        }

        customer.setName(request.getName().trim());
        customer.setPhone(newPhone);
        customer.setLicensePlate(newPlate);

        User user = customer.getUser();
        if (user != null) {
            user.setFullName(request.getName().trim());
            user.setPhone(newPhone);
            userRepository.save(user);
        }
        Customer savedCustomer = customerRepository.save(customer);
        return customerMapper.toResponse(savedCustomer);
    }
    // tìm hoặc tự tạo mới hồ sơ
    private Customer getOrCreateCustomer(String email) {
        return customerRepository.findByUserEmail(email)
                .orElseGet(() -> {
                    User user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
                    
                    String userPhone = (user.getPhone() != null && !user.getPhone().trim().isEmpty()) ? user.getPhone().trim() : null;
                    
                    Customer newCustomer = Customer.builder()
                            .name(user.getFullName())
                            .phone(userPhone)
                            .user(user)
                            .build();
                    return customerRepository.save(newCustomer);
                });
    }
}
