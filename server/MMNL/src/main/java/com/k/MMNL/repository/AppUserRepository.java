package com.k.MMNL.repository;

import com.k.MMNL.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AppUserRepository extends JpaRepository<AppUser, UUID> {
    boolean existsByGoogleSubject(String sub);
    Optional<AppUser> findByGoogleSubject(String sub);
}
