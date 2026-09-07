package com.marketmap.backend.product.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record ProductLocationRequest(
        @NotNull
        UUID productId,

        @NotNull
        UUID shelfSectionId) {
}
