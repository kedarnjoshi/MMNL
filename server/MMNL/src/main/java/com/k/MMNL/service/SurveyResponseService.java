package com.k.MMNL.service;

import com.k.MMNL.repository.SurveyResponseRepository;
import org.springframework.stereotype.Service;

@Service
public class SurveyResponseService {
    private final SurveyResponseRepository surveyResponseRepository;

    public SurveyResponseService(SurveyResponseRepository surveyResponseRepository) {
        this.surveyResponseRepository = surveyResponseRepository;
    }
}
