package com.k.MMNL.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "role_assignments")
public class RoleAssignment {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "pending_email")
    private String pendingEmail;

    @Column(name = "department")
    private String department;

    @Column(name = "level", nullable = false)
    private String level;

    @Column(name = "finance_access", nullable = false)
    private boolean financeAccess;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "assigned_by")
    private UUID assignedBy;

    @Version
    private long version;

    protected RoleAssignment() {}                      // required by JPA

    public RoleAssignment(UUID eventId, String level, String status) {
        this.eventId = eventId;
        this.level = level;
        this.status = status;
    }

    // getters only (no public setters)
    public UUID getId() { return id; }
    public UUID getEventId() { return eventId; }
    public UUID getUserId() { return userId; }
    public String getPendingEmail() { return pendingEmail; }
    public String getDepartment() { return department; }
    public String getLevel() { return level; }
    public boolean isFinanceAccess() { return financeAccess; }
    public String getStatus() { return status; }
    public UUID getAssignedBy() { return assignedBy; }
}
