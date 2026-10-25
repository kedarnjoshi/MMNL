package com.k.MMNL.service;

import com.k.MMNL.dto.TicketDTO;
import com.k.MMNL.dto.ticketTailor.TtEvent;
import com.k.MMNL.dto.ticketTailor.TtTicketList;
import com.k.MMNL.model.LoggedInUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TicketService {
    private final RestClient client;
    private final Logger log = LoggerFactory.getLogger(this.getClass());

    public TicketService(RestClient client) {
        this.client = client;
    }

    public List<TicketDTO> getTickets(LoggedInUser loggedInUser) {
        String email = loggedInUser.getEmail();
        Map<String, TtEvent> cache = new HashMap<>();

        TtTicketList res = client.get()
                .uri("/issued_tickets?email={email}", email)
                .retrieve()
                .body(TtTicketList.class);

        if (res == null || res.data() == null) return List.of();

        if (res.links() != null && res.links().next() != null) {
            log.warn("Ticket list has more than one page; results truncated");
        }

        return res.data().stream()
//                .filter(t -> email.equalsIgnoreCase(t.email()))
                .map(t -> TicketDTO.from(t, cache.computeIfAbsent(t.eventId(), this::fetchEvent)))
                .toList();
    }

    private TtEvent fetchEvent(String eventId) {
        try {
            return client.get().uri("/events/{id}", eventId).retrieve().body(TtEvent.class);
        } catch (HttpClientErrorException.NotFound e) {
            return null;
        }
    }
}
