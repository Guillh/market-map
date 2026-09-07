package com.marketmap.backend.inventory.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.marketmap.backend.inventory.InventoryLot;

public record InventoryLotResponse(
        UUID id,
        UUID inventoryItemId,
        UUID productLocationId,
        UUID productId,
        String productName,
        String lotCode,
        LocalDate expirationDate,
        Integer quantity,
        Instant createdAt,
        Instant updatedAt) {

    public static InventoryLotResponse from(InventoryLot lot) {
        return new InventoryLotResponse(
                lot.getId(),
                lot.getInventoryItem().getId(),
                lot.getInventoryItem().getProductLocation().getId(),
                lot.getInventoryItem().getProductLocation().getProduct().getId(),
                lot.getInventoryItem().getProductLocation().getProduct().getName(),
                lot.getLotCode(),
                lot.getExpirationDate(),
                lot.getQuantity(),
                lot.getCreatedAt(),
                lot.getUpdatedAt());
    }
}
