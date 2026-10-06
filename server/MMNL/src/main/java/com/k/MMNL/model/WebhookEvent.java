package com.k.MMNL.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "webhook_events")
public class WebhookEvent {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(name = "provider", nullable = false)
    private String provider;

    @Column(name = "idempotency_key", nullable = false, unique = true)
    private String idempotencyKey;

    @Column(name = "signature_ok", nullable = false)
    private boolean signatureOk;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload")
    private Map<String, Object> payload;

    @Column(name = "received_at", nullable = false)
    private Instant receivedAt;

    @Column(name = "processed_at")
    private Instant processedAt;

    @Column(name = "error", columnDefinition = "text")
    private String error;

    @Version
    private long version;

    protected WebhookEvent() {}                      // required by JPA

    public WebhookEvent(String provider, String idempotencyKey) {
        this.provider = provider;
        this.idempotencyKey = idempotencyKey;
    }

    @PrePersist
    void onCreate() {
        if (receivedAt == null) receivedAt = Instant.now();
    }

    // getters only (no public setters)
    public UUID getId() { return id; }
    public String getProvider() { return provider; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public boolean isSignatureOk() { return signatureOk; }
    public Map<String, Object> getPayload() { return payload; }
    public Instant getReceivedAt() { return receivedAt; }
    public Instant getProcessedAt() { return processedAt; }
    public String getError() { return error; }
}
