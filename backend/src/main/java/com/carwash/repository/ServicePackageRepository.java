package com.carwash.repository;

import com.carwash.entity.ServicePackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServicePackageRepository extends JpaRepository<ServicePackage, Long> {

    List<ServicePackage> findByActiveTrue();

    boolean existsByName(String name);
}
