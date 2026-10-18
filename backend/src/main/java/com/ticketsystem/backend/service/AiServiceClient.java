package com.ticketsystem.backend.service;

import com.ticketsystem.backend.entity.TicketCategory;
import com.ticketsystem.backend.entity.TicketPriority;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class AiServiceClient {

    private static final Logger log = LoggerFactory.getLogger(AiServiceClient.class);

    private final RestTemplate restTemplate;

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public AiServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // Simple container holding the classified category and priority
    public static class ClassificationResult {
        private final TicketCategory category;
        private final TicketPriority priority;

        public ClassificationResult(TicketCategory category, TicketPriority priority) {
            this.category = category;
            this.priority = priority;
        }

        public TicketCategory getCategory() {
            return category;
        }

        public TicketPriority getPriority() {
            return priority;
        }
    }

    // Call POST /classify on the FastAPI service (falls back to GENERAL/MEDIUM on any error)
    public ClassificationResult classifyTicket(String title, String description) {
        try {
            String url = aiServiceUrl + "/classify";
            Map<String, String> request = Map.of(
                    "title", title,
                    "description", description
            );

            Map<?, ?> response = restTemplate.postForObject(url, request, Map.class);
            if (response != null) {
                String catStr = String.valueOf(response.get("category")).toUpperCase();
                String prioStr = String.valueOf(response.get("priority")).toUpperCase();

                TicketCategory category = parseCategory(catStr);
                TicketPriority priority = parsePriority(prioStr);
                return new ClassificationResult(category, priority);
            }
        } catch (Exception e) {
            // Rule: If AI call fails, use category GENERAL and priority MEDIUM so the app never breaks
            log.warn("AI classify service unavailable ({}). Using safe defaults.", e.getMessage());
        }

        return new ClassificationResult(TicketCategory.GENERAL, TicketPriority.MEDIUM);
    }

    // Call POST /suggest-reply on the FastAPI service
    public String getSuggestedReply(String title, String description, String category) {
        try {
            String url = aiServiceUrl + "/suggest-reply";
            Map<String, String> request = Map.of(
                    "title", title,
                    "description", description,
                    "category", category
            );

            Map<?, ?> response = restTemplate.postForObject(url, request, Map.class);
            if (response != null && response.containsKey("suggested_reply")) {
                return String.valueOf(response.get("suggested_reply"));
            }
        } catch (Exception e) {
            log.warn("AI reply service unavailable ({}). Using default fallback reply.", e.getMessage());
        }

        return "Thank you for reaching out. We have received your ticket and our team is looking into it.";
    }

    private TicketCategory parseCategory(String value) {
        try {
            return TicketCategory.valueOf(value);
        } catch (Exception e) {
            return TicketCategory.GENERAL;
        }
    }

    private TicketPriority parsePriority(String value) {
        try {
            return TicketPriority.valueOf(value);
        } catch (Exception e) {
            return TicketPriority.MEDIUM;
        }
    }
}
