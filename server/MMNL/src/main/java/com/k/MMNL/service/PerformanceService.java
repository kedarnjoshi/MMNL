package com.k.MMNL.service;

import com.k.MMNL.repository.PerformanceRepository;
import org.springframework.stereotype.Service;

@Service
public class PerformanceService {
    private final PerformanceRepository performanceRepository;

    public PerformanceService(PerformanceRepository performanceRepository) {
        this.performanceRepository = performanceRepository;
    }
}
