package com.k.MMNL.dto;

import com.k.MMNL.dto.ticketTailor.TtEvent;
import com.k.MMNL.dto.ticketTailor.TtTicket;
import com.k.MMNL.dto.ticketTailor.TtTicketType;
import com.k.MMNL.dto.ticketTailor.TtVenue;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

public record TicketDTO(
        String id,
        String eventId,
        String eventTitle,
        String venue,
        Instant startsAt,
        Instant endsAt,
        String ticketType,
        String status,
        String qrUrl,
        String barcode,
        String attendeeName,
        @JsonProperty("isComplimentary") boolean isComplimentary
) {
    public static TicketDTO from(TtTicket t, TtEvent e) {
        return new TicketDTO(
                t.id(),
                t.eventId(),
                e != null ? e.name() : null,
                e != null && e.venue() != null ? e.venue().name() : null,
                e != null && e.start() != null ? Instant.ofEpochSecond(e.start().unix()) : null,
                e != null && e.end() != null ? Instant.ofEpochSecond(e.end().unix()) : null,
                resolveTicketType(t, e),
                mapStatus(t),
                t.qrCodeUrl(),
                t.barcode(),
                t.fullName(),
                t.listedPrice() != null && t.listedPrice() == 0
        );
    }

    private static String resolveTicketType(TtTicket t, TtEvent e) {
        if (e != null && e.ticketTypes() != null && t.ticketTypeId() != null) {
            for (TtTicketType type : e.ticketTypes()) {
                if (t.ticketTypeId().equals(type.id())) {
                    return type.name();
                }
            }
        }
        return t.description();   // fallback, e.g. "Free ticket"
    }

    private static String mapStatus(TtTicket t) {
        if (t.voidedAt() != null || "void".equalsIgnoreCase(t.status())) return "CANCELLED";
        if (Boolean.TRUE.equals(t.checkedIn())) return "CHECKED_IN";
        return "ISSUED";
    }
}