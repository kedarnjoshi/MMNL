package com.k.MMNL.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "expenses")
public class Expense {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(name = "claim_id", nullable = false)
    private UUID claimId;

    @Column(name = "amount_cents", nullable = false)
    private long amountCents;

    @Column(name = "receipt_key")
    private String receiptKey;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "approved_by")
    private UUID approvedBy;

    @Column(name = "reimbursed_at")
    private Instant reimbursedAt;

    @Version
    private long version;

    protected Expense() {}                      // required by JPA

    public Expense(UUID claimId, long amountCents, String status) {
        this.claimId = claimId;
        this.amountCents = amountCents;
        this.status = status;
    }

    // getters only (no public setters)
    public UUID getId() { return id; }
    public UUID getClaimId() { return claimId; }
    public long getAmountCents() { return amountCents; }
    public String getReceiptKey() { return receiptKey; }
    public String getStatus() { return status; }
    public UUID getApprovedBy() { return approvedBy; }
    public Instant getReimbursedAt() { return reimbursedAt; }
}
