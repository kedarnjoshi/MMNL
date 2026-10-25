package com.k.MMNL.dto;

import java.util.UUID;

public record SurveyDTO(
        UUID id,
        String eventId,
        String eventTitle,
        String status,
        boolean submitted
) {
}
