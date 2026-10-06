package com.k.MMNL.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "sponsors")
public class Sponsor {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Column(name = "company", nullable = false)
    private String company;

    @Column(name = "contact_name")
    private String contactName;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "tier")
    private String tier;

    @Column(name = "pledged_cents")
    private Long pledgedCents;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "comp_allotted", nullable = false)
    private int compAllotted;

    @Column(name = "is_public", nullable = false)
    private boolean publicListed;

    @Column(name = "logo_key")
    private String logoKey;

    @Version
    private long version;

    protected Sponsor() {}                      // required by JPA

    public Sponsor(UUID eventId, String company, String status) {
        this.eventId = eventId;
        this.company = company;
        this.status = status;
    }

    // getters only (no public setters)
    public UUID getId() { return id; }
    public UUID getEventId() { return eventId; }
    public String getCompany() { return company; }
    public String getContactName() { return contactName; }
    public String getContactEmail() { return contactEmail; }
    public String getTier() { return tier; }
    public Long getPledgedCents() { return pledgedCents; }
    public String getStatus() { return status; }
    public int getCompAllotted() { return compAllotted; }
    public boolean isPublicListed() { return publicListed; }
    public String getLogoKey() { return logoKey; }
}
