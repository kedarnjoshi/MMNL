package com.k.MMNL.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "comp_passes")
public class CompPass {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(name = "sponsor_id", nullable = false)
    private UUID sponsorId;

    @Column(name = "ticket_id")
    private UUID ticketId;

    @Column(name = "recipient_email", nullable = false)
    private String recipientEmail;

    @Column(name = "ticket_type")
    private String ticketType;

    @Column(name = "voided_at")
    private Instant voidedAt;

    @Version
    private long version;

    protected CompPass() {}                      // required by JPA

    public CompPass(UUID sponsorId, String recipientEmail) {
        this.sponsorId = sponsorId;
        this.recipientEmail = recipientEmail;
    }

    // getters only (no public setters)
    public UUID getId() { return id; }
    public UUID getSponsorId() { return sponsorId; }
    public UUID getTicketId() { return ticketId; }
    public String getRecipientEmail() { return recipientEmail; }
    public String getTicketType() { return ticketType; }
    public Instant getVoidedAt() { return voidedAt; }
}
