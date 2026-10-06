package com.k.MMNL.service;


import com.k.MMNL.model.AppUser;
import com.k.MMNL.repository.AppUserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AppUserService {
    private final AppUserRepository appUserRepository;

    public AppUserService(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    @Transactional
    public void grantSuperAdmin(UUID userId) {
        AppUser u = appUserRepository.findById(userId).orElseThrow(/* not found */);
        u.grantSuperAdmin();   // changes the Java object only
        // no save() call needed
    }
}
