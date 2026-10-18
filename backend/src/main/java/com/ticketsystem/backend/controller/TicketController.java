package com.ticketsystem.backend.controller;

import com.ticketsystem.backend.dto.CreateTicketRequest;
import com.ticketsystem.backend.dto.TicketResponse;
import com.ticketsystem.backend.dto.UpdateTicketStatusRequest;
import com.ticketsystem.backend.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(@Valid @RequestBody CreateTicketRequest request,
                                                       Authentication authentication) {
        TicketResponse response = ticketService.createTicket(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<TicketResponse>> getMyTickets(Authentication authentication) {
        List<TicketResponse> tickets = ticketService.getMyTickets(authentication.getName());
        return ResponseEntity.ok(tickets);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        List<TicketResponse> tickets = ticketService.getAllTickets();
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable Long id,
                                                        Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        TicketResponse ticket = ticketService.getTicketById(id, authentication.getName(), isAdmin);
        return ResponseEntity.ok(ticket);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketResponse> updateTicketStatus(@PathVariable Long id,
                                                            @Valid @RequestBody UpdateTicketStatusRequest request) {
        TicketResponse ticket = ticketService.updateTicketStatus(id, request);
        return ResponseEntity.ok(ticket);
    }
}
