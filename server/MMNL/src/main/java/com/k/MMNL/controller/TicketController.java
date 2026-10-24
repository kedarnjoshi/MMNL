package com.k.MMNL.controller;


import com.k.MMNL.service.TicketService;
import org.springframework.web.bind.annotation.RestController;

@RestController("/api/v1/me/tickets")
public class TicketController {
    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }
}
