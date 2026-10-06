package com.k.MMNL.service;

import com.k.MMNL.repository.EmailOutboxRepository;
import org.springframework.stereotype.Service;

@Service
public class EmailOutboxService {
    private final EmailOutboxRepository emailOutboxRepository;

    public EmailOutboxService(EmailOutboxRepository emailOutboxRepository) {
        this.emailOutboxRepository = emailOutboxRepository;
    }
}
