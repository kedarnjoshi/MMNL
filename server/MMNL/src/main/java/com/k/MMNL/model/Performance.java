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
    private String eventId;

    @Column(name = "submitted_by", nullable = false)
    private String submittedByGoogleSub;

    @Column(name = "group_name", nullable = false)
    private String groupName;

    @Column(name = "type", nullable = false)
    @Enumerated(EnumType.STRING)
    private PerformanceType type;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private PerformanceStatus status;

    @Column(name = "status_reason")
    private String statusReason;

    @Column(name = "lineup_position")
    private Integer lineupPosition;

    @Column(name = "lineup_locked", nullable = false)
    private boolean lineupLocked;

    @Version
    private long version;

    protected Performance() {}                      // required by JPA

    public Performance(String eventId, String submittedByGoogleSub, String groupName, PerformanceType type, PerformanceStatus status) {
        this.eventId = eventId;
        this.submittedByGoogleSub = submittedByGoogleSub;
        this.groupName = groupName;
        this.type = type;
        this.status = status;
    }

    public Performance(String eventId, String submittedByGoogleSub, String groupName, PerformanceType type, Integer durationMinutes, String description, PerformanceStatus status, String statusReason, Integer lineupPosition, boolean lineupLocked) {
        this.eventId = eventId;
        this.submittedByGoogleSub = submittedByGoogleSub;
        this.groupName = groupName;
        this.type = type;
        this.durationMinutes = durationMinutes;
        this.description = description;
        this.status = status;
        this.statusReason = statusReason;
        this.lineupPosition = lineupPosition;
        this.lineupLocked = lineupLocked;
    }

    public UUID getId() { return id; }
    public String getEventId() { return eventId; }
    public String getSubmittedByGoogleSub() { return submittedByGoogleSub; }
    public String getGroupName() { return groupName; }
    public PerformanceType getType() { return type; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public String getDescription() { return description; }
    public PerformanceStatus getStatus() { return status; }
    public String getStatusReason() { return statusReason; }
    public Integer getLineupPosition() { return lineupPosition; }
    public boolean isLineupLocked() { return lineupLocked; }

    public void setId(UUID id) {
        this.id = id;
    }
}
