package com.k.MMNL.repository;

import com.k.MMNL.model.Performance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PerformanceRepository extends JpaRepository<Performance, UUID> {
    List<Performance> findBySubmittedByGoogleSub(String submittedByGoogleSub);
}
