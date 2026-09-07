package com.marketmap.backend.inventory.dto;

import java.time.Instant;
import java.util.UUID;

import com.marketmap.backend.inventory.InventoryItem;

public record InventoryItemResponse(
        UUID id,
        UUID productLocationId,
        UUID productId,
        String productName,
        String productSku,
        UUID shelfSectionId,
        Integer quantity,
        Integer minimumQuantity,
        boolean belowMinimum,
        Instant createdAt,
        Instant updatedAt) {

    public static InventoryItemResponse from(InventoryItem item) {
        return new InventoryItemResponse(
                item.getId(),
                item.getProductLocation().getId(),
                item.getProductLocation().getProduct().getId(),
                item.getProductLocation().getProduct().getName(),
                item.getProductLocation().getProduct().getSku(),
                item.getProductLocation().getShelfSection().getId(),
                item.getQuantity(),
                item.getMinimumQuantity(),
                item.getQuantity() < item.getMinimumQuantity(),
                item.getCreatedAt(),
                item.getUpdatedAt());
    }
}
