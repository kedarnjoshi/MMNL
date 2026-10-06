package com.k.MMNL.repository;

import com.k.MMNL.model.SurveyResponse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SurveyResponseRepository extends JpaRepository<SurveyResponse, UUID> {
}
