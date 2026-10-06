package com.k.MMNL.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "procurement_items")
public class ProcurementItem {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "required_quantity", nullable = false)
    private int requiredQuantity;

    @Column(name = "estimated_cost_cents")
    private Long estimatedCostCents;

    @Column(name = "deadline")
    private Instant deadline;

    @Version
    private long version;

    protected ProcurementItem() {}                      // required by JPA

    public ProcurementItem(UUID eventId, String name, int requiredQuantity) {
        this.eventId = eventId;
        this.name = name;
        this.requiredQuantity = requiredQuantity;
    }

    // getters only (no public setters)
    public UUID getId() { return id; }
    public UUID getEventId() { return eventId; }
    public String getName() { return name; }
    public int getRequiredQuantity() { return requiredQuantity; }
    public Long getEstimatedCostCents() { return estimatedCostCents; }
    public Instant getDeadline() { return deadline; }
}
