package com.ticketsystem.backend.repository;

import com.ticketsystem.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Used during login to look up user by email
    Optional<User> findByEmail(String email);

    // Used during registration to check for duplicate email
    boolean existsByEmail(String email);
}
