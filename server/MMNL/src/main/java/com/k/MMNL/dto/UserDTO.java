package com.k.MMNL.dto;

import com.k.MMNL.model.AppUser;
import com.k.MMNL.model.RoleAssignment;

import java.util.List;
import java.util.UUID;

public record UserDTO (
    UUID id,
    String email,
    String firstName,
    String fullName,
    Boolean isSuperAdmin
){
    public static UserDTO from(AppUser appUser) {
        return new UserDTO(
                appUser.getId(),
                appUser.getEmail(),
                appUser.getFullName(),
                appUser.getFullName(),
                appUser.isSuperAdmin()
        );
    }
}
