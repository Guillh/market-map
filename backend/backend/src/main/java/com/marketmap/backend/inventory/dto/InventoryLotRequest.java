package com.marketmap.backend.inventory.dto;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record InventoryLotRequest(
        @NotNull
        UUID inventoryItemId,

        @NotBlank
        @Size(max = 120)
        String lotCode,

        LocalDate expirationDate,

        @NotNull
        @Min(0)
        Integer quantity) {
}
