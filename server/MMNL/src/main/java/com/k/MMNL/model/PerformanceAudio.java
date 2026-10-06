package com.k.MMNL.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "performance_audio")
public class PerformanceAudio {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(name = "performance_id", nullable = false)
    private UUID performanceId;

    @Column(name = "storage_key", nullable = false)
    private String storageKey;

    @Column(name = "original_filename")
    private String originalFilename;

    @Column(name = "mime")
    private String mime;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "reviewer_id")
    private UUID reviewerId;

    @Column(name = "reviewer_note", columnDefinition = "text")
    private String reviewerNote;

    @Version
    private long version;

    protected PerformanceAudio() {}                      // required by JPA

    public PerformanceAudio(UUID performanceId, String storageKey, String status) {
        this.performanceId = performanceId;
        this.storageKey = storageKey;
        this.status = status;
    }

    // getters only (no public setters)
    public UUID getId() { return id; }
    public UUID getPerformanceId() { return performanceId; }
    public String getStorageKey() { return storageKey; }
    public String getOriginalFilename() { return originalFilename; }
    public String getMime() { return mime; }
    public Long getSizeBytes() { return sizeBytes; }
    public String getStatus() { return status; }
    public UUID getReviewerId() { return reviewerId; }
    public String getReviewerNote() { return reviewerNote; }
}
