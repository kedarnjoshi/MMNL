package com.k.MMNL.service;

import com.k.MMNL.repository.ProcurementItemRepository;
import org.springframework.stereotype.Service;

@Service
public class ProcurementItemService {
    private final ProcurementItemRepository procurementItemRepository;

    public ProcurementItemService(ProcurementItemRepository procurementItemRepository) {
        this.procurementItemRepository = procurementItemRepository;
    }
}
