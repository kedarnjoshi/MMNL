package com.k.MMNL.repository;

import com.k.MMNL.model.ProcurementItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProcurementItemRepository extends JpaRepository<ProcurementItem, UUID> {
}
