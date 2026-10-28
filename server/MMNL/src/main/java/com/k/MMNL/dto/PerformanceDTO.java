package com.k.MMNL.dto;

import com.k.MMNL.model.Participant;
import com.k.MMNL.model.Performance;
import com.k.MMNL.model.PerformanceStatus;
import com.k.MMNL.model.PerformanceType;

import java.util.List;
import java.util.UUID;

public record PerformanceDTO(
        UUID id,
        String eventId,
        String eventTitle,
        String groupName,
        PerformanceType type,
        PerformanceStatus status,
        String statusReason,
        Integer durationMinutes,
        String description,
        List<Participant> participants
        ) {

    public static PerformanceDTO from(Performance performance, EventSummary eventSummary, List<Participant> participants) {
        if (!performance.getEventId().equalsIgnoreCase(eventSummary.id())) {
            throw new IllegalArgumentException("Event IDs don't match");
        }
        return new PerformanceDTO(
                performance.getId(),
                performance.getEventId(),
                eventSummary.title(),
                performance.getGroupName(),
                performance.getType(),
                performance.getStatus(),
                performance.getStatusReason(),
                performance.getDurationMinutes(),
                performance.getDescription(),
                participants
        );
    }
}
