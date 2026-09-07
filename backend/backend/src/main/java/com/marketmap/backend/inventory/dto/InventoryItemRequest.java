package com.marketmap.backend.inventory.dto;

import java.util.UUID;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record InventoryItemRequest(
        @NotNull
        UUID productLocationId,

        @NotNull
        @Min(0)
        Integer quantity,

        @NotNull
        @Min(0)
        Integer minimumQuantity) {
}
