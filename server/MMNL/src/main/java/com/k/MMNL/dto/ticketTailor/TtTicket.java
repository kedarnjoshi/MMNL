package com.k.MMNL.dto.ticketTailor;

import com.fasterxml.jackson.annotation.JsonProperty;
import tools.jackson.databind.JsonNode;

import java.util.List;

public record TtTicket(
        String object,
        String id,
        @JsonProperty("add_on_id") String addOnId,
        String barcode,
        @JsonProperty("barcode_url") String barcodeUrl,
        @JsonProperty("checked_in") Boolean checkedIn,
        @JsonProperty("created_at") Long createdAt,
        @JsonProperty("custom_questions") List<JsonNode> customQuestions,
        String description,
        String email,
        @JsonProperty("event_id") String eventId,
        @JsonProperty("event_series_id") String eventSeriesId,
        @JsonProperty("group_ticket_barcode") String groupTicketBarcode,
        String reference,
        @JsonProperty("full_name") String fullName,
        @JsonProperty("first_name") String firstName,
        @JsonProperty("last_name") String lastName,
        @JsonProperty("listed_currency") TtListedCurrency listedCurrency,
        @JsonProperty("listed_price") Integer listedPrice,
        String status,
        String source,
        @JsonProperty("ticket_type_id") String ticketTypeId,
        @JsonProperty("updated_at") Long updatedAt,
        @JsonProperty("voided_at") Long voidedAt,
        @JsonProperty("order_id") String orderId,
        @JsonProperty("qr_code_url") String qrCodeUrl
) {}
