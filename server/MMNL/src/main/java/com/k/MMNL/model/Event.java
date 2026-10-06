package com.k.MMNL.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
public class Event {

    @Id
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    UUID id;
}
