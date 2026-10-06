package com.k.MMNL.service;

import com.k.MMNL.repository.PerformanceAudioRepository;
import org.springframework.stereotype.Service;

@Service
public class PerformanceAudioService {
    private final PerformanceAudioRepository performanceAudioRepository;

    public PerformanceAudioService(PerformanceAudioRepository performanceAudioRepository) {
        this.performanceAudioRepository = performanceAudioRepository;
    }
}
