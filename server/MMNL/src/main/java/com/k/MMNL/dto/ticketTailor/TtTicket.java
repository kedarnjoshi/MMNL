package com.k.MMNL.dto.ticketTailor;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TtTicket(
        String id,
        @JsonProperty("barcode_url") String barcodeUrl,
        @JsonProperty("checked_in") boolean checkedIn,
        @JsonProperty("event_id") String eventId,
        @JsonProperty("full_name") String fullName,
        @JsonProperty("listed_currency") TtListedCurrency listedCurrency,
        @JsonProperty("listed_price") Integer listedPrice,
        String status,
        @JsonProperty("qr_code_url") String qrCodeUrl
) {}
