package com.k.MMNL.dto;

import com.k.MMNL.dto.ticketTailor.TtEvent;

import java.time.Instant;

public record EventSummary(
        String id,
        String title,
        Instant startsAt,
        Instant endsAt,
        String venue,
        String bannerUrl,
        String ticketTailorUrl,
        Instant registrationDeadline,
        boolean registrationOpen
) {
    public static EventSummary from(TtEvent e) {
        return new EventSummary(
                e.id(),
                e.name(),
                e.start() != null ? Instant.ofEpochSecond(e.start().unix()) : null,
                e.end() != null ? Instant.ofEpochSecond(e.end().unix()) : null,
                e.venue() != null ? e.venue().name() : null,
                e.images() != null ? e.images().header() : null,
                e.url(),
                e.ticketsUnavailableAt() != null ? Instant.ofEpochSecond(e.ticketsUnavailableAt()) : null,
                Boolean.TRUE.equals(e.ticketsAvailable())
        );
    }
}
