package com.k.MMNL.model;

import com.k.MMNL.dto.EventDTO;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
public class Event {

    @Id
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    UUID id;

    String title;

    Instant startsAt;

    Instant endsAt;

    String venue;

    String bannerUrl;

    String ticketTailorUrl;

    Instant registrationDeadline;

    boolean registrationOpen;

    public EventDTO getDTO() {
        return new EventDTO(
                id,
                title,
                startsAt,
                endsAt,
                venue,
                bannerUrl,
                ticketTailorUrl,
                registrationDeadline,
                registrationOpen
        );
    }
}