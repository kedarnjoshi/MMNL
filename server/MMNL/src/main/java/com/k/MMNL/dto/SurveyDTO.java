package com.k.MMNL.dto;

import com.k.MMNL.model.Survey;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public record SurveyDTO(
        UUID id,
        String eventId,
        String eventTitle,
        String status,
        boolean submitted
) {
    public static List<SurveyDTO> from(
            List<Survey> surveys,
            List<EventSummary> events,
            List<Boolean> submitted
    ) {
        List<SurveyDTO> surveyDTOS = new ArrayList<>();
        for (int i = 0; i < surveys.size(); i++) {
            Survey survey = surveys.get(i);
            EventSummary eventSummary = events.get(i);
            boolean isSubmitted = submitted.get(i);
            SurveyDTO surveyDTO = new SurveyDTO(
                    survey.getId(),
                    survey.getEventId(),
                    eventSummary.title(),
                    survey.getStatus(),
                    isSubmitted
            );
            surveyDTOS.add(surveyDTO);
        }
        return surveyDTOS;
    }
}
