package com.ticketsystem.backend.service;

import com.ticketsystem.backend.dto.CreateTicketRequest;
import com.ticketsystem.backend.dto.TicketResponse;
import com.ticketsystem.backend.dto.UpdateTicketStatusRequest;
import com.ticketsystem.backend.entity.Ticket;
import com.ticketsystem.backend.entity.TicketCategory;
import com.ticketsystem.backend.entity.TicketPriority;
import com.ticketsystem.backend.entity.TicketStatus;
import com.ticketsystem.backend.entity.User;
import com.ticketsystem.backend.repository.TicketRepository;
import com.ticketsystem.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final AiServiceClient aiServiceClient;

    public TicketService(TicketRepository ticketRepository,
                         UserRepository userRepository,
                         AiServiceClient aiServiceClient) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.aiServiceClient = aiServiceClient;
    }

    public TicketResponse createTicket(CreateTicketRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle().trim());
        ticket.setDescription(request.getDescription().trim());
        ticket.setUser(user);
        ticket.setStatus(TicketStatus.OPEN);

        // Synchronous call to FastAPI AI service to classify category & priority
        AiServiceClient.ClassificationResult classification =
                aiServiceClient.classifyTicket(ticket.getTitle(), ticket.getDescription());
        ticket.setCategory(classification.getCategory());
        ticket.setPriority(classification.getPriority());

        // Synchronous call to FastAPI AI service to generate a suggested reply for the admin
        String suggestedReply = aiServiceClient.getSuggestedReply(
                ticket.getTitle(),
                ticket.getDescription(),
                classification.getCategory().name()
        );
        ticket.setSuggestedReply(suggestedReply);

        Ticket savedTicket = ticketRepository.save(ticket);
        return new TicketResponse(savedTicket);
    }

    public List<TicketResponse> getMyTickets(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return ticketRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(TicketResponse::new)
                .toList();
    }

    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(TicketResponse::new)
                .toList();
    }

    public TicketResponse getTicketById(Long id, String userEmail, boolean isAdmin) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        boolean isOwner = ticket.getUser().getEmail().equalsIgnoreCase(userEmail);
        if (!isAdmin && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to view this ticket");
        }

        return new TicketResponse(ticket);
    }

    public TicketResponse updateTicketStatus(Long id, UpdateTicketStatusRequest request) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        ticket.setStatus(request.getStatus());
        Ticket updatedTicket = ticketRepository.save(ticket);
        return new TicketResponse(updatedTicket);
    }
}
