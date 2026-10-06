package com.k.MMNL.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

@Entity
@Table(name = "app_users")
public class AppUser {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;                       // always lowercased

    @Column(name = "google_subject", nullable = false, unique = true)
    private String googleSubject;               // Google's stable "sub" claim

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "picture_url")
    private String pictureUrl;

    @Column(name = "is_super_admin", nullable = false)
    private boolean superAdmin;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @Column(name = "anonymised_at")
    private Instant anonymisedAt;

    @Version
    private long version;

    protected AppUser() {}                      // required by JPA

    public AppUser(String email, String googleSubject, String fullName, String pictureUrl) {
        this.email = email;
        this.googleSubject = googleSubject;
        this.fullName = fullName;
        this.pictureUrl = pictureUrl;
    }

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
        email = email.trim().toLowerCase(Locale.ROOT);
    }

    public void recordLogin(String fullName, String pictureUrl) {
        this.lastLoginAt = Instant.now();
        this.fullName = fullName;
        this.pictureUrl = pictureUrl;
    }

    public void grantSuperAdmin()  { this.superAdmin = true; }
    public void revokeSuperAdmin() { this.superAdmin = false; }

    // getters only (no public setters)
    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public String getGoogleSubject() { return googleSubject; }
    public String getFullName() { return fullName; }
    public String getPictureUrl() { return pictureUrl; }
    public boolean isSuperAdmin() { return superAdmin; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getLastLoginAt() { return lastLoginAt; }
    public Instant getAnonymisedAt() { return anonymisedAt; }
}