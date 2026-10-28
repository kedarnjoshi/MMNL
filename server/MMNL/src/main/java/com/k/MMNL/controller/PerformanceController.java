package com.k.MMNL.controller;

import com.k.MMNL.dto.PerformanceDTO;
import com.k.MMNL.dto.requests.CreatePerformanceRequest;
import com.k.MMNL.model.LoggedInUser;
import com.k.MMNL.model.Participant;
import com.k.MMNL.model.Performance;
import com.k.MMNL.model.PerformanceStatus;
import com.k.MMNL.service.EventService;
import com.k.MMNL.service.ParticipantService;
import com.k.MMNL.service.PerformanceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
public class PerformanceController {

    private final PerformanceService performanceService;
    private final ParticipantService participantService;
    private final EventService eventService;

    public PerformanceController(PerformanceService performanceService, ParticipantService participantService, EventService eventService) {
        this.performanceService = performanceService;
        this.participantService = participantService;
        this.eventService = eventService;
    }

    @GetMapping("/api/v1/me/performances")
    public ResponseEntity<List<PerformanceDTO>> findAll(@AuthenticationPrincipal OAuth2User user) {
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        LoggedInUser lu = new LoggedInUser(user);
        if (!lu.isVerified()) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(performanceService.findByUserSub(lu.getSub()).stream().map(p -> PerformanceDTO.from(
                p,
                eventService.getEventById(p.getEventId()),
                participantService.findByPerformanceId(p.getId())
        )).toList());
    }

    @PostMapping("/api/v1/events/{eventId}/performances")
    public ResponseEntity<UUID> newPerformance(
            @PathVariable String eventId,
            @RequestBody CreatePerformanceRequest request,
            @AuthenticationPrincipal OAuth2User user
    ) {
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        LoggedInUser lu = new LoggedInUser(user);
        if (!lu.isVerified()) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        // Check if registerations are open!!! TODO
        Performance saved = performanceService.save(request, eventService.getEventById(eventId), lu);
        List<Participant> participants = participantService.save(request, saved);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved.getId());
    }

    @GetMapping("/api/v1/performances/{id}")
    public ResponseEntity<PerformanceDTO> findOne(@PathVariable UUID id, @AuthenticationPrincipal OAuth2User user) {
        if (id == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        LoggedInUser lu = new LoggedInUser(user);
        if (!lu.isVerified()) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        Optional<Performance> p = performanceService.findById(id);
        if (p.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Performance performance = p.get();
        if (!performance.getSubmittedByGoogleSub().equals(lu.getSub())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(PerformanceDTO.from(
                performance,
                eventService.getEventById(performance.getEventId()),
                participantService.findByPerformanceId(performance.getId())
        ));
    }

    @PutMapping("/api/v1/performances/{id}")
    public ResponseEntity<UUID> updatePerformance(
            @PathVariable UUID id,
            @RequestBody CreatePerformanceRequest request,
            @AuthenticationPrincipal OAuth2User user
    ) {
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        LoggedInUser lu = new LoggedInUser(user);
        if (!lu.isVerified()) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        Optional<Performance> p = performanceService.findById(id);
        if (p.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Performance performance = p.get();
        if (!performance.getSubmittedByGoogleSub().equals(lu.getSub())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        if (performance.getStatus().equals(PerformanceStatus.DRAFT) || performance.getStatus().equals(PerformanceStatus.REJECTED)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        performanceService.update(id, request, eventService.getEventById(performance.getEventId()), lu);
        participantService.save(request, performance);
        return ResponseEntity.ok(performance.getId());
    }

    @PostMapping("/api/v1/performances/{id}/withdraw")
    public ResponseEntity<UUID> withdrawPerformance(
            @PathVariable UUID id,
            @AuthenticationPrincipal OAuth2User user
    ) {
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        LoggedInUser lu = new LoggedInUser(user);
        if (!lu.isVerified()) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        Optional<Performance> p = performanceService.findById(id);
        if (p.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Performance performance = p.get();
        if (!performance.getSubmittedByGoogleSub().equals(lu.getSub())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        performanceService.delete(id);
        participantService.deleteByPerformanceId(id);
        return ResponseEntity.ok().build();
    }

}
