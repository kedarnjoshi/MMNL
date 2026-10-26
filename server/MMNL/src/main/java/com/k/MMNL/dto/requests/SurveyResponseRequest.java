package com.k.MMNL.dto.requests;

public record SurveyResponseRequest(
        Integer overall,
        Integer food,
        Integer cultural,
        Integer venue,
        String comment
) {
}
