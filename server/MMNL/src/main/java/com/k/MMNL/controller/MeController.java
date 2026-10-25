package com.k.MMNL.controller;

import com.k.MMNL.dto.EventSummary;
import com.k.MMNL.dto.SurveyDTO;
import com.k.MMNL.dto.TicketDTO;
import com.k.MMNL.dto.UserDTO;
import com.k.MMNL.model.AppUser;
import com.k.MMNL.model.Event;
import com.k.MMNL.model.LoggedInUser;
import com.k.MMNL.model.Survey;
import com.k.MMNL.service.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
public class MeController {

    private final AppUserService appUserService;

    private final String superAdminEmail;
    private final TicketService ticketService;
    private final SurveyService surveyService;
    private final SurveyResponseService surveyResponseService;
    private final EventService eventService;

    public MeController(
            AppUserService appUserService,
            @Value("${app.super-admin-email}") String superAdminEmail,
            TicketService ticketService,
            SurveyService surveyService,
            SurveyResponseService surveyResponseService,
            EventService eventService
    ) {
        this.appUserService = appUserService;
        this.superAdminEmail = superAdminEmail;
        this.ticketService = ticketService;
        this.surveyService = surveyService;
        this.surveyResponseService = surveyResponseService;
        this.eventService = eventService;
    }

    @GetMapping("/api/me")
    public ResponseEntity<UserDTO> me(@AuthenticationPrincipal OAuth2User user) {
        if  (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        String sub = user.getAttribute("sub");
        String email = user.getAttribute("email");
        boolean verified = Boolean.TRUE.equals(user.getAttribute("email_verified"));
        String name = user.getAttribute("name");
        String picture = user.getAttribute("picture");

        LoggedInUser loggedInUser = new LoggedInUser(user);

        AppUser u;
        if (!appUserService.containsUser(loggedInUser.getSub())) {
            u = new AppUser(email, sub, name, picture);
            appUserService.addUser(u);

            if (verified && u.getEmail().trim().equals(superAdminEmail)) appUserService.grantSuperAdmin(u.getId());
        }
        else {
            u = appUserService.getUser(loggedInUser.getSub());
        }
        return ResponseEntity.ok(UserDTO.from(u));
    }

    @GetMapping("/api/v1/me/tickets")
    public ResponseEntity<List<TicketDTO>> getTickets(@AuthenticationPrincipal OAuth2User user) {
        if  (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        LoggedInUser lu = new LoggedInUser(user);
        if (!lu.isVerified()) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity
                .ok()
                .cacheControl(CacheControl.noStore())
                .body(ticketService.getTickets(lu))
                ;
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
                .filter(t -> t.status().equalsIgnoreCase("CHECKED_IN"))
                .map(TicketDTO::eventId)
                .collect(Collectors.toSet());
        List<Survey> surveys = surveyService.getAllSurveysByStatusAndEventId("OPEN", checkedInEvents);
        List<Boolean> isSubmitted = surveys
                .stream()
                .map(
                        a -> surveyResponseService.isSubmitted(a, lu.getSub()))
                .toList();
        List<EventSummary> events = checkedInEvents
                .stream()
                .map(eventService::getEventById)
                .toList();
        return ResponseEntity.ok(SurveyDTO.from(
                surveys,
                events,
                isSubmitted
        ));
    }
}
