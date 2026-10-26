package com.k.MMNL.service;

import com.k.MMNL.model.Survey;
import com.k.MMNL.model.SurveyResponse;
import com.k.MMNL.repository.SurveyResponseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class SurveyResponseService {
    private final SurveyResponseRepository surveyResponseRepository;

    public SurveyResponseService(SurveyResponseRepository surveyResponseRepository) {
        this.surveyResponseRepository = surveyResponseRepository;
    }

    public boolean isSubmitted (Survey survey, String googleSub) {
        List<SurveyResponse> surveyResponses = surveyResponseRepository.findBySurveyId(survey.getId());
        boolean result = false;
        for (SurveyResponse surveyResponse : surveyResponses) {
            if (surveyResponse.getGoogleSub().equalsIgnoreCase(googleSub)) {
                result = true;
                break;
            }
        }
        return result;
    }

    public SurveyResponse save(SurveyResponse surveyResponse) {
        return surveyResponseRepository.save(surveyResponse);
    }
}
