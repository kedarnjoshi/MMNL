package com.k.MMNL.dto.ticketTailor;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record TtEvent(
        String id,
        String name,
        String status,
        Boolean hidden,
        TtEventTime start,
        TtEventTime end,
        TtVenue venue,
        TtImages images,
        String url,
        @JsonProperty("tickets_available") Boolean ticketsAvailable,
        @JsonProperty("tickets_unavailable_at") Long ticketsUnavailableAt,
        @JsonProperty("ticket_types") List<TtTicketType> ticketTypes
) {}
