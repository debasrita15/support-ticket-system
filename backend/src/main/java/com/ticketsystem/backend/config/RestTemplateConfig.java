package com.ticketsystem.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    // RestTemplate bean for making HTTP calls to our Python FastAPI AI service
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
