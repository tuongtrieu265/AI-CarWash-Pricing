package com.carwash.repository;

import com.carwash.entity.AuthSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<AuthSession, Long> {

    Optional<AuthSession> findByToken(String token);

    @Query("SELECT s FROM AuthSession s WHERE s.user.id = :userId AND s.revoked = false")
    List<AuthSession> findAllValidSessionsByUser(@Param("userId") Long userId);
}