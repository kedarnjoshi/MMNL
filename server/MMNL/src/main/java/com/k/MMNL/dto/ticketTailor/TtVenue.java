package com.k.MMNL.dto.ticketTailor;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TtVenue(
        String name,
        String country,
        @JsonProperty("postal_code") String postalCode
) {}
