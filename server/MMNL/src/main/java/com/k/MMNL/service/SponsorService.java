package com.k.MMNL.service;

import com.k.MMNL.repository.SponsorRepository;
import org.springframework.stereotype.Service;

@Service
public class SponsorService {
    private final SponsorRepository sponsorRepository;

    public SponsorService(SponsorRepository sponsorRepository) {
        this.sponsorRepository = sponsorRepository;
    }
}
