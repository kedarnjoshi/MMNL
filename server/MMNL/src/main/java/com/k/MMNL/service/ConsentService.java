package com.k.MMNL.service;

import com.k.MMNL.repository.ConsentRepository;
import org.springframework.stereotype.Service;

@Service
public class ConsentService {
    private final ConsentRepository consentRepository;

    public ConsentService(ConsentRepository consentRepository) {
        this.consentRepository = consentRepository;
    }
}
