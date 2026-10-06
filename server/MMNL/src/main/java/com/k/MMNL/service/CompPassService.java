package com.k.MMNL.service;

import com.k.MMNL.repository.CompPassRepository;
import org.springframework.stereotype.Service;

@Service
public class CompPassService {
    private final CompPassRepository compPassRepository;

    public CompPassService(CompPassRepository compPassRepository) {
        this.compPassRepository = compPassRepository;
    }
}
