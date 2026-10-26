package com.k.MMNL.repository;

import com.k.MMNL.model.Survey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SurveyRepository extends JpaRepository<Survey, UUID> {
    List<Survey> findAllByStatus(String status);
    Survey findSurveyById(UUID id);
}
