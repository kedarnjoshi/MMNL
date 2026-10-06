package com.k.MMNL.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "participants")
public class Participant {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(name = "performance_id", nullable = false)
    private UUID performanceId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "is_minor", nullable = false)
    private boolean minor;

    @Column(name = "guardian_name")
    private String guardianName;

    @Column(name = "guardian_email")
    private String guardianEmail;

    @Version
    private long version;

    protected Participant() {}                      // required by JPA

    public Participant(UUID performanceId, String fullName) {
        this.performanceId = performanceId;
        this.fullName = fullName;
    }

    // getters only (no public setters)
    public UUID getId() { return id; }
    public UUID getPerformanceId() { return performanceId; }
    public String getFullName() { return fullName; }
    public boolean isMinor() { return minor; }
    public String getGuardianName() { return guardianName; }
    public String getGuardianEmail() { return guardianEmail; }
}
