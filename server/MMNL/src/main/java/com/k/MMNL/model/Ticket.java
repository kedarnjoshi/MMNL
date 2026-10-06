package com.k.MMNL.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(name = "ticket_tailor_ticket_id", nullable = false, unique = true)
    private String ticketTailorTicketId;

    @Column(name = "ticket_tailor_order_id")
    private String ticketTailorOrderId;

    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "buyer_email")
    private String buyerEmail;

    @Column(name = "attendee_name")
    private String attendeeName;

    @Column(name = "ticket_type")
    private String ticketType;

    @Column(name = "barcode")
    private String barcode;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "price_paid_cents")
    private Long pricePaidCents;

    @Column(name = "currency")
    private String currency;

    @Column(name = "is_complimentary", nullable = false)
    private boolean complimentary;

    @Version
    private long version;

    protected Ticket() {}                      // required by JPA

    public Ticket(String ticketTailorTicketId, UUID eventId, String status) {
        this.ticketTailorTicketId = ticketTailorTicketId;
        this.eventId = eventId;
        this.status = status;
    }

    // getters only (no public setters)
    public UUID getId() { return id; }
    public String getTicketTailorTicketId() { return ticketTailorTicketId; }
    public String getTicketTailorOrderId() { return ticketTailorOrderId; }
    public UUID getEventId() { return eventId; }
    public UUID getUserId() { return userId; }
    public String getBuyerEmail() { return buyerEmail; }
    public String getAttendeeName() { return attendeeName; }
    public String getTicketType() { return ticketType; }
    public String getBarcode() { return barcode; }
    public String getStatus() { return status; }
    public Long getPricePaidCents() { return pricePaidCents; }
    public String getCurrency() { return currency; }
    public boolean isComplimentary() { return complimentary; }
}
