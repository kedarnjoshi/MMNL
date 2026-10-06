package com.k.MMNL.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "consents")
public class Consent {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(name = "participant_id", nullable = false)
    private UUID participantId;

    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Column(name = "scope", nullable = false)
    private String scope;

    @Column(name = "given", nullable = false)
    private boolean given;

    @Column(name = "method")
    private String method;

    @Column(name = "recorded_by")
    private UUID recordedBy;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;

    @Column(name = "withdrawn_at")
    private Instant withdrawnAt;

    @Version
    private long version;

    protected Consent() {}                      // required by JPA

    public Consent(UUID participantId, UUID eventId, String scope) {
        this.participantId = participantId;
        this.eventId = eventId;
        this.scope = scope;
    }

    @PrePersist
    void onCreate() {
        if (recordedAt == null) recordedAt = Instant.now();
    }

    // getters only (no public setters)
    public UUID getId() { return id; }
    public UUID getParticipantId() { return participantId; }
    public UUID getEventId() { return eventId; }
    public String getScope() { return scope; }
    public boolean isGiven() { return given; }
    public String getMethod() { return method; }
    public UUID getRecordedBy() { return recordedBy; }
    public Instant getRecordedAt() { return recordedAt; }
    public Instant getWithdrawnAt() { return withdrawnAt; }
}
