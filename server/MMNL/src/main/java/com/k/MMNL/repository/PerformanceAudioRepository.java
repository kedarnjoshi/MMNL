package com.k.MMNL.repository;

import com.k.MMNL.model.PerformanceAudio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PerformanceAudioRepository extends JpaRepository<PerformanceAudio, UUID> {
}
