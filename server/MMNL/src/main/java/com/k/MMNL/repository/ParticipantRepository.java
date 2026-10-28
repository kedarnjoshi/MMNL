package com.k.MMNL.repository;

import com.k.MMNL.model.Participant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ParticipantRepository extends JpaRepository<Participant, UUID> {
    List<Participant> findByPerformanceId(UUID performanceId);
    void deleteByPerformanceId(UUID performanceId);
}
