package com.k.MMNL.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class TicketService {
    private final RestClient client;

    public TicketService(RestClient client) {
        this.client = client;
    }


}
