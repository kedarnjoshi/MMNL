package com.k.MMNL.service;

import com.k.MMNL.repository.RoleAssignmentRepository;
import org.springframework.stereotype.Service;

@Service
public class RoleAssignmentService {
    private final RoleAssignmentRepository roleAssignmentRepository;

    public RoleAssignmentService(RoleAssignmentRepository roleAssignmentRepository) {
        this.roleAssignmentRepository = roleAssignmentRepository;
    }
}
