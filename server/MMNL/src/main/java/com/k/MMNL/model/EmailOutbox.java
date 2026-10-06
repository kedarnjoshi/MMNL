package com.k.MMNL.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "email_outbox")
public class EmailOutbox {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(name = "to_email", nullable = false)
    private String toEmail;

    @Column(name = "template", nullable = false)
    private String template;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload")
    private Map<String, Object> payload;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "attempts", nullable = false)
    private int attempts;

    @Column(name = "next_attempt_at")
    private Instant nextAttemptAt;

    @Version
    private long version;

    protected EmailOutbox() {}                      // required by JPA

    public EmailOutbox(String toEmail, String template, String status) {
        this.toEmail = toEmail;
        this.template = template;
        this.status = status;
    }

    // getters only (no public setters)
    public UUID getId() { return id; }
    public String getToEmail() { return toEmail; }
    public String getTemplate() { return template; }
    public Map<String, Object> getPayload() { return payload; }
    public String getStatus() { return status; }
    public int getAttempts() { return attempts; }
    public Instant getNextAttemptAt() { return nextAttemptAt; }
}
