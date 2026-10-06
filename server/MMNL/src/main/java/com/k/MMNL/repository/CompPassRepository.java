package com.k.MMNL.repository;

import com.k.MMNL.model.CompPass;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CompPassRepository extends JpaRepository<CompPass, UUID> {
}
