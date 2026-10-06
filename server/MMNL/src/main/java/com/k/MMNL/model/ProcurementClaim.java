package com.k.MMNL.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "procurement_claims")
public class ProcurementClaim {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "status", nullable = false)
    private String status;

    @Version
    private long version;

    protected ProcurementClaim() {}                      // required by JPA

    public ProcurementClaim(UUID itemId, UUID userId, int quantity, String status) {
        this.itemId = itemId;
        this.userId = userId;
        this.quantity = quantity;
        this.status = status;
    }

    // getters only (no public setters)
    public UUID getId() { return id; }
    public UUID getItemId() { return itemId; }
    public UUID getUserId() { return userId; }
    public int getQuantity() { return quantity; }
    public String getStatus() { return status; }
}
