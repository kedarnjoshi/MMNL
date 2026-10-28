package com.k.MMNL.dto.requests;

import com.k.MMNL.model.Participant;
import com.k.MMNL.model.PerformanceType;

import java.util.List;

public record CreatePerformanceRequest(
        String groupName,
        PerformanceType type,
        Integer durationMinutes,
        String description,
        List<Participant> participants,
        Boolean submit) {
}
