package com.k.MMNL.repository;

import com.k.MMNL.model.RoleAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RoleAssignmentRepository extends JpaRepository<RoleAssignment, UUID> {
}
