package com.k.MMNL.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "audit_log")
public class AuditLog {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(name = "at", nullable = false)
    private Instant at;

    @Column(name = "actor_id")
    private UUID actorId;

    @Column(name = "event_id")
    private UUID eventId;

    @Column(name = "action", nullable = false)
    private String action;

    @Column(name = "entity_type")
    private String entityType;

    @Column(name = "entity_id")
    private UUID entityId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "detail")
    private Map<String, Object> detail;

    protected AuditLog() {}                      // required by JPA

    public AuditLog(String action) {
        this.action = action;
    }

    @PrePersist
    void onCreate() {
        if (at == null) at = Instant.now();
    }

    // getters only (no public setters)
    public UUID getId() { return id; }
    public Instant getAt() { return at; }
    public UUID getActorId() { return actorId; }
    public UUID getEventId() { return eventId; }
    public String getAction() { return action; }
    public String getEntityType() { return entityType; }
    public UUID getEntityId() { return entityId; }
    public Map<String, Object> getDetail() { return detail; }
}
