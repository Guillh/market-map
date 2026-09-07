package com.marketmap.backend.inventory.dto;

import java.util.UUID;

import com.marketmap.backend.inventory.InventoryMovementType;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record InventoryMovementRequest(
        @NotNull
        UUID productLocationId,

        @NotNull
        InventoryMovementType type,

        @NotNull
        @Min(1)
        Integer quantity,

        @Size(max = 255)
        String reason) {
}
