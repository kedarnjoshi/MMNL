package com.k.MMNL.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "assets")
public class Asset {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Column(name = "department")
    private String department;

    @Column(name = "category")
    private String category;

    @Column(name = "storage_key", nullable = false)
    private String storageKey;

    @Column(name = "filename")
    private String filename;

    @Column(name = "uploaded_by")
    private UUID uploadedBy;

    @Version
    private long version;

    protected Asset() {}                      // required by JPA

    public Asset(UUID eventId, String storageKey) {
        this.eventId = eventId;
        this.storageKey = storageKey;
    }

    // getters only (no public setters)
    public UUID getId() { return id; }
    public UUID getEventId() { return eventId; }
    public String getDepartment() { return department; }
    public String getCategory() { return category; }
    public String getStorageKey() { return storageKey; }
    public String getFilename() { return filename; }
    public UUID getUploadedBy() { return uploadedBy; }
}
