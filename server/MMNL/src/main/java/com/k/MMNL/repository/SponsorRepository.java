package com.k.MMNL.repository;

import com.k.MMNL.model.Sponsor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SponsorRepository extends JpaRepository<Sponsor, UUID> {
}
