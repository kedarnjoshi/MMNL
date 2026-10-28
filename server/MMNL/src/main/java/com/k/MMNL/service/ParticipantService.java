package com.k.MMNL.service;

import com.k.MMNL.dto.EventSummary;
import com.k.MMNL.dto.requests.CreatePerformanceRequest;
import com.k.MMNL.model.LoggedInUser;
import com.k.MMNL.model.Participant;
import com.k.MMNL.model.Performance;
import com.k.MMNL.repository.ParticipantRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ParticipantService {
    private final ParticipantRepository participantRepository;

    public ParticipantService(ParticipantRepository participantRepository) {
        this.participantRepository = participantRepository;
    }

    public List<Participant> findByPerformanceId(UUID performanceId) {
        return  participantRepository.findByPerformanceId(performanceId);
    }

    public List<Participant> save(CreatePerformanceRequest request, Performance p) {
        List<Participant> participants = request.participants();
        participants.forEach(participant -> {
            participant.setPerformanceId(p.getId());
            participantRepository.save(participant);
        });
        return participants;
    }

    public void deleteByPerformanceId(UUID performanceId) {
        participantRepository.deleteByPerformanceId(performanceId);
    }
}
