package com.k.MMNL.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

import java.util.List;

@Configuration
public class TicketTailorConfig {

    @Bean
    RestClient ticketTailorRestClient(@Value("${app.ticket-tailor-api-key}") String apiKey) {
        return RestClient.builder()
                .baseUrl("https://api.tickettailor.com/v1")
                .defaultHeaders(h -> {
                    h.setBasicAuth(apiKey, "");   // Ticket Tailor uses API key as basic-auth username
                    h.setAccept(List.of(MediaType.APPLICATION_JSON));
                })
                .build();
    }
}
