package com.k.MMNL.service;

import com.k.MMNL.repository.SponsorPaymentRepository;
import org.springframework.stereotype.Service;

@Service
public class SponsorPaymentService {
    private final SponsorPaymentRepository sponsorPaymentRepository;

    public SponsorPaymentService(SponsorPaymentRepository sponsorPaymentRepository) {
        this.sponsorPaymentRepository = sponsorPaymentRepository;
    }
}
