package com.ticketsystem.backend.service;

import com.ticketsystem.backend.dto.AuthResponse;
import com.ticketsystem.backend.dto.LoginRequest;
import com.ticketsystem.backend.dto.RegisterRequest;
import com.ticketsystem.backend.entity.Role;
import com.ticketsystem.backend.entity.User;
import com.ticketsystem.backend.repository.UserRepository;
import com.ticketsystem.backend.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // Register a new user with BCrypt password hashing and default role USER
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();

        // 1. Check if email is already taken -> Return 409 Conflict
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        // 2. Create user with hashed password (never plain text) and USER role
        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER); // All new registrations get USER role

        User savedUser = userRepository.save(user);

        // 3. Generate JWT and return response
        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole().name());
        return new AuthResponse(token, savedUser.getName(), savedUser.getEmail(), savedUser.getRole());
    }

    // Authenticate user credentials and return a signed JWT
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();

        User user = userRepository.findByEmail(normalizedEmail).orElse(null);

        // 1. If email does not exist in database, return 404 so UI can tell user to register
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No account found with this email. Please register first.");
        }

        // 2. If password does not match, return 401
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Incorrect password. Please try again.");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getName(), user.getEmail(), user.getRole());
    }
}
