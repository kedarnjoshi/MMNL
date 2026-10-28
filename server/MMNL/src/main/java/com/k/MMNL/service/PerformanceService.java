package com.k.MMNL.service;

import com.k.MMNL.dto.EventSummary;
import com.k.MMNL.dto.requests.CreatePerformanceRequest;
import com.k.MMNL.model.LoggedInUser;
import com.k.MMNL.model.Performance;
import com.k.MMNL.model.PerformanceStatus;
import com.k.MMNL.repository.PerformanceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PerformanceService {
    private final PerformanceRepository performanceRepository;

    public PerformanceService(PerformanceRepository performanceRepository) {
        this.performanceRepository = performanceRepository;
    }

    public List<Performance> findByUserSub(String sub) {
        return performanceRepository.findBySubmittedByGoogleSub(sub);
    }
    public Optional<Performance> findById(UUID id) {
        return performanceRepository.findById(id);
    }
    public Performance save(CreatePerformanceRequest request, EventSummary event, LoggedInUser lu) {
        Performance performance = new Performance(
                event.id(),
                lu.getSub(),
                request.groupName(),
                request.type(),
                request.durationMinutes(),
                request.description(),
                request.submit() ? PerformanceStatus.REGISTERED : PerformanceStatus.DRAFT,
                "",
                null,
                false

        );
        return performanceRepository.save(performance);
    }

    public Performance update(UUID id, CreatePerformanceRequest request, EventSummary event, LoggedInUser lu) {
        Performance performance = new Performance(
                event.id(),
                lu.getSub(),
                request.groupName(),
                request.type(),
                request.durationMinutes(),
                request.description(),
                request.submit() ? PerformanceStatus.REGISTERED : PerformanceStatus.DRAFT,
                "",
                null,
                false

        );
        performance.setId(id);
        return performanceRepository.save(performance);
    }

    public void delete(UUID id) {
        performanceRepository.deleteById(id);
    }
}
