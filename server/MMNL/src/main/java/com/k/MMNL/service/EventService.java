package com.k.MMNL.service;

import com.k.MMNL.dto.EventSummary;
import com.k.MMNL.dto.ticketTailor.TtEvent;
import com.k.MMNL.dto.ticketTailor.TtEventList;
import com.k.MMNL.model.Event;
import com.k.MMNL.repository.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
public class EventService {
    private final EventRepository eventRepository;
    private final RestClient client;

    public EventService(EventRepository eventRepository, RestClient client) {
        this.eventRepository = eventRepository;
        this.client = client;
    }

    public List<Event> getEvents() {
        return eventRepository.findAll();
    }

    public List<EventSummary> listEvents() {
        TtEventList res = client.get()
                .uri("/events")
                .retrieve()
                .body(TtEventList.class);

        return res.data().stream()
                .filter(e -> !Boolean.TRUE.equals(e.hidden()))
                .map(EventSummary::from)
                .toList();
    }
}
