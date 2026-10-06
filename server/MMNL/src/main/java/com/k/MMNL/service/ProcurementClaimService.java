package com.k.MMNL.service;

import com.k.MMNL.repository.ProcurementClaimRepository;
import org.springframework.stereotype.Service;

@Service
public class ProcurementClaimService {
    private final ProcurementClaimRepository procurementClaimRepository;

    public ProcurementClaimService(ProcurementClaimRepository procurementClaimRepository) {
        this.procurementClaimRepository = procurementClaimRepository;
    }
}
