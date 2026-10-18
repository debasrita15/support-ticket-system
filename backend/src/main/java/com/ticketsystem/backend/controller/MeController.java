package com.ticketsystem.backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MeController {

    // Protected endpoint: Spring Security blocks requests here unless a valid JWT is provided
    @GetMapping("/me")
    public String me(Authentication authentication) {
        // authentication.getName() returns the email extracted from the verified JWT
        return "You are logged in as: " + authentication.getName();
    }
}
