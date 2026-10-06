package com.k.MMNL.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "performances")
public class Performance {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Column(name = "submitted_by", nullable = false)
    private UUID submittedBy;

    @Column(name = "group_name", nullable = false)
    private String groupName;

    @Column(name = "type", nullable = false)
    private PerformanceType type;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "status_reason")
    private String statusReason;

    @Column(name = "lineup_position")
    private Integer lineupPosition;

    @Column(name = "lineup_locked", nullable = false)
    private boolean lineupLocked;

    @Version
    private long version;

    protected Performance() {}                      // required by JPA

    public Performance(UUID eventId, UUID submittedBy, String groupName, PerformanceType type, String status) {
        this.eventId = eventId;
        this.submittedBy = submittedBy;
        this.groupName = groupName;
        this.type = type;
        this.status = status;
    }

    // getters only (no public setters)
    public UUID getId() { return id; }
    public UUID getEventId() { return eventId; }
    public UUID getSubmittedBy() { return submittedBy; }
    public String getGroupName() { return groupName; }
    public PerformanceType getType() { return type; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public String getDescription() { return description; }
    public String getStatus() { return status; }
    public String getStatusReason() { return statusReason; }
    public Integer getLineupPosition() { return lineupPosition; }
    public boolean isLineupLocked() { return lineupLocked; }
}
