package com.k.MMNL.controller;

import com.k.MMNL.dto.EventSummary;
import com.k.MMNL.dto.SurveyDTO;
import com.k.MMNL.dto.TicketDTO;
import com.k.MMNL.dto.requests.SurveyResponseRequest;
import com.k.MMNL.model.LoggedInUser;
import com.k.MMNL.model.Survey;
import com.k.MMNL.model.SurveyResponse;
import com.k.MMNL.service.EventService;
import com.k.MMNL.service.SurveyResponseService;
import com.k.MMNL.service.SurveyService;
import com.k.MMNL.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
public class SurveyController {
    private final TicketService ticketService;
    private final SurveyService surveyService;
    private final SurveyResponseService surveyResponseService;
    private final EventService eventService;


    public SurveyController(TicketService ticketService, SurveyService surveyService, SurveyResponseService surveyResponseService, EventService eventService) {
        this.ticketService = ticketService;
        this.surveyService = surveyService;
        this.surveyResponseService = surveyResponseService;
        this.eventService = eventService;
    }

    @GetMapping("/api/v1/me/surveys")
    public ResponseEntity<List<SurveyDTO>> getSurveys(@AuthenticationPrincipal OAuth2User user) {
        if  (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        LoggedInUser lu = new LoggedInUser(user);
        if (!lu.isVerified()) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        Set<String> checkedInEvents = ticketService
                .getTickets(lu)
                .stream()
                .filter(t -> "CHECKED_IN".equalsIgnoreCase(t.status()))
                .map(TicketDTO::eventId)
                .collect(Collectors.toSet());
        if (checkedInEvents.isEmpty()) return ResponseEntity.ok(List.of());
        List<Survey> surveys = surveyService.getAllSurveysByStatusAndEventId("OPEN", checkedInEvents);
        List<Boolean> isSubmitted = surveys
                .stream()
                .map(
                        a -> surveyResponseService.isSubmitted(a, lu.getSub()))
                .toList();
        Map<String, EventSummary> eventsById = new HashMap<>();
        List<EventSummary> events = surveys.stream()
                .map(s -> eventsById.computeIfAbsent(s.getEventId(), eventService::getEventById))
                .toList();
        return ResponseEntity.ok(
                SurveyDTO.from(
                surveys,
                events,
                isSubmitted
        ));
    }

    @PostMapping("/api/v1/surveys/{surveyId}/responses")
    public ResponseEntity<SurveyResponseRequest> addResponse(
            @AuthenticationPrincipal OAuth2User user,
            @PathVariable("surveyId") UUID surveyId,
            @Valid @RequestBody SurveyResponseRequest request
            ) {

        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        LoggedInUser lu = new LoggedInUser(user);
        if (!lu.isVerified()) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        Survey s = surveyService.findSurveyById(surveyId);
        if (s == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        if (surveyResponseService.isSubmitted(s, lu.getSub())) {
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }
        if (!"OPEN".equalsIgnoreCase(s.getStatus())) {
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }
        SurveyResponse sr = SurveyResponse.from(request, lu, surveyId);
        surveyResponseService.save(sr);
        return ResponseEntity.status(HttpStatus.CREATED).body(request);
    }
}
