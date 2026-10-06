package com.k.MMNL.repository;

import com.k.MMNL.model.EmailOutbox;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface EmailOutboxRepository extends JpaRepository<EmailOutbox, UUID> {
}
