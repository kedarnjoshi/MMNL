package com.k.MMNL.dto;

import com.k.MMNL.model.Event;

import java.time.Instant;
import java.util.UUID;

public class EventDTO {
    private UUID id;

    private String title;

    private Instant startsAt;

    private Instant endsAt;

    private String venue;

    private String bannerUrl;

    private String ticketTailorUrl;

    private Instant registrationDeadline;

    private boolean registrationOpen;

    public EventDTO(UUID id, String title, Instant startsAt, Instant endsAt, String venue, String bannerUrl, String ticketTailorUrl, Instant registrationDeadline, boolean registrationOpen) {
        this.id = id;
        this.title = title;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
        this.venue = venue;
        this.bannerUrl = bannerUrl;
        this.ticketTailorUrl = ticketTailorUrl;
        this.registrationDeadline = registrationDeadline;
        this.registrationOpen = registrationOpen;
    }

}
