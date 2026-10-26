//package com.k.MMNL.controller;
//
//import com.k.MMNL.dto.SurveyDTO;
//import com.k.MMNL.dto.TicketDTO;
//import com.k.MMNL.model.LoggedInUser;
//import com.k.MMNL.service.EventService;
//import com.k.MMNL.service.SurveyResponseService;
//import com.k.MMNL.service.SurveyService;
//import com.k.MMNL.service.TicketService;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.oauth2.core.user.OAuth2User;
//
//import java.time.Instant;
//import java.util.List;
//
//import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.anyString;
//import static org.mockito.Mockito.mock;
//import static org.mockito.Mockito.when;
//
//class SurveyControllerTest {
//
//    private TicketService ticketService;
//    private SurveyService surveyService;
//    private SurveyResponseService surveyResponseService;
//    private EventService eventService;
//    private OAuth2User user;
//    private SurveyController surveyController;
//
//    @BeforeEach
//    void setUp() {
//        ticketService = mock(TicketService.class);
//        surveyService = mock(SurveyService.class);
//        surveyResponseService = mock(SurveyResponseService.class);
//        eventService = mock(EventService.class);
//        user = mock(OAuth2User.class);
//        surveyController = new SurveyController(
//                ticketService,
//                surveyService,
//                surveyResponseService,
//                eventService
//        );
//    }
//
//    @Test
//    void getSurveysTest() {
//        when(user.getAttribute(anyString())).thenReturn("true");
//        when(ticketService.getTickets(any(LoggedInUser.class))).thenReturn(List.of(
//                new TicketDTO(
//                        "t1",
//                        "e1",
//                        "Ganeshotsav 2025",
//                        "Aalsmeer",
//                        Instant.MIN,
//                        Instant.MAX
//                )
//        ));
//    }
//
//    @Test
//    void userNullTest() {
//        ResponseEntity<List<SurveyDTO>> response = surveyController.getSurveys(null);
//        assertNotNull(response);
//        assertThat(response).isEqualTo(new ResponseEntity<>(HttpStatus.UNAUTHORIZED));
//    }
//
//    @Test
//    void userNotVerifiedTest() {
//        when(user.getAttribute(anyString())).thenReturn("false");
//        ResponseEntity<List<SurveyDTO>> response = surveyController.getSurveys(user);
//        assertNotNull(response);
//    }
//
//    @Test
//    void addResponseTest() {
//    }
//}