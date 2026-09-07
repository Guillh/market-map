package com.marketmap.backend.inventory.dto;

import java.time.Instant;
import java.util.UUID;

import com.marketmap.backend.inventory.InventoryMovement;
import com.marketmap.backend.inventory.InventoryMovementType;

public record InventoryMovementResponse(
        UUID id,
        UUID productLocationId,
        UUID productId,
        String productName,
        InventoryMovementType type,
        Integer quantity,
        String reason,
        Instant createdAt) {

    public static InventoryMovementResponse from(InventoryMovement movement) {
        return new InventoryMovementResponse(
                movement.getId(),
                movement.getProductLocation().getId(),
                movement.getProductLocation().getProduct().getId(),
                movement.getProductLocation().getProduct().getName(),
                movement.getType(),
                movement.getQuantity(),
                movement.getReason(),
                movement.getCreatedAt());
    }
}
