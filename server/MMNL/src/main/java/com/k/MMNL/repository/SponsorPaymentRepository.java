package com.k.MMNL.repository;

import com.k.MMNL.model.SponsorPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SponsorPaymentRepository extends JpaRepository<SponsorPayment, UUID> {
}
