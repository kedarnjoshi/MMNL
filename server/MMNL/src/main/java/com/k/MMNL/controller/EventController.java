package com.k.MMNL.controller;

import com.k.MMNL.dto.EventSummary;
import com.k.MMNL.dto.ticketTailor.TtEvent;
import com.k.MMNL.service.EventService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/events")
public class EventController {
    private final EventService eventService;


    /**
     * Constructor for EventController
     * @param eventService the database service for events management
     */
    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping("")
    public List<EventSummary> getEvents() {
        return eventService.listEvents();
    }

    @GetMapping("/{eventId}")
    public EventSummary getEvent(@PathVariable String eventId) {
        return eventService.getEventById(eventId);
    }

}
