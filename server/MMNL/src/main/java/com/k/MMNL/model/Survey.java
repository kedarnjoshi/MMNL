package com.k.MMNL.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "surveys")
public class Survey {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(name = "event_id", nullable = false)
    private String eventId;

    @Column(name = "status", nullable = false)
    private String status;

    protected Survey() {}                      // required by JPA

    public Survey(String eventId, String status) {
        this.eventId = eventId;
        this.status = status;
    }

    // getters only (no public setters)
    public UUID getId() { return id; }
    public String getEventId() { return eventId; }
    public String getStatus() { return status; }
}
