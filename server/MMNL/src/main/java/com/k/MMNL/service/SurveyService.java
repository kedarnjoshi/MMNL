package com.k.MMNL.service;

import com.k.MMNL.model.Survey;
import com.k.MMNL.repository.SurveyRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class SurveyService {
    private final SurveyRepository surveyRepository;

    public SurveyService(SurveyRepository surveyRepository) {
        this.surveyRepository = surveyRepository;
    }

    public List<Survey> getAllSurveys() {
        return surveyRepository.findAll();
    }

    public List<Survey> getAllSurveysByStatus(String status) {
        return surveyRepository.findAllByStatus(status);
    }

    public List<Survey> getAllSurveysByStatusAndEventId(String status, String eventId) {
        return surveyRepository.findAllByStatus(status).stream().filter(
                x -> x.getEventId().trim().equalsIgnoreCase(eventId.trim())
        ).toList();
    }

    public List<Survey> getAllSurveysByStatusAndEventId(String status, Set<String> eventIds) {
        List<Survey> surveys = surveyRepository.findAllByStatus(status);
        return surveys.stream().filter(x -> eventIds.contains(x.getEventId().trim())).toList();
    }
}
