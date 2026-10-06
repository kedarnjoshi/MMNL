package com.k.MMNL.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "sponsor_payments")
public class SponsorPayment {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(name = "sponsor_id", nullable = false)
    private UUID sponsorId;

    @Column(name = "amount_cents", nullable = false)
    private long amountCents;

    @Column(name = "paid_on", nullable = false)
    private LocalDate paidOn;

    @Column(name = "note")
    private String note;

    protected SponsorPayment() {}                      // required by JPA

    public SponsorPayment(UUID sponsorId, long amountCents, LocalDate paidOn) {
        this.sponsorId = sponsorId;
        this.amountCents = amountCents;
        this.paidOn = paidOn;
    }

    // getters only (no public setters)
    public UUID getId() { return id; }
    public UUID getSponsorId() { return sponsorId; }
    public long getAmountCents() { return amountCents; }
    public LocalDate getPaidOn() { return paidOn; }
    public String getNote() { return note; }
}
