package com.k.MMNL.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Column(name = "department")
    private String department;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "assignee_id")
    private UUID assigneeId;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "file_key")
    private String fileKey;

    @Version
    private long version;

    protected Task() {}                      // required by JPA

    public Task(UUID eventId, String title, String status) {
        this.eventId = eventId;
        this.title = title;
        this.status = status;
    }

    // getters only (no public setters)
    public UUID getId() { return id; }
    public UUID getEventId() { return eventId; }
    public String getDepartment() { return department; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getStatus() { return status; }
    public UUID getAssigneeId() { return assigneeId; }
    public LocalDate getDueDate() { return dueDate; }
    public String getFileKey() { return fileKey; }
}
