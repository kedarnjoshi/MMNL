package com.k.MMNL.dto.ticketTailor;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TtListedCurrency(
        @JsonProperty("base_multiplier") int baseMultiplier,
        String code
) {}
