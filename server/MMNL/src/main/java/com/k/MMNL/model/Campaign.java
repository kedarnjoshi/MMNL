package com.k.MMNL.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "campaigns")
public class Campaign {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Column(name = "platform", nullable = false)
    private String platform;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "notes", columnDefinition = "text")
    private String notes;

    @Version
    private long version;

    protected Campaign() {}                      // required by JPA

    public Campaign(UUID eventId, String platform, String status) {
        this.eventId = eventId;
        this.platform = platform;
        this.status = status;
    }

    // getters only (no public setters)
    public UUID getId() { return id; }
    public UUID getEventId() { return eventId; }
    public String getPlatform() { return platform; }
    public String getStatus() { return status; }
    public String getNotes() { return notes; }
}
