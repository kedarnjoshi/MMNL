package com.k.MMNL.repository;

import com.k.MMNL.model.ProcurementClaim;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProcurementClaimRepository extends JpaRepository<ProcurementClaim, UUID> {
}
