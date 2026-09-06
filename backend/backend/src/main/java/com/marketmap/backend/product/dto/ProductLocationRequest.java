package com.marketmap.backend.product.dto;

import com.marketmap.backend.product.Product;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record ProductLocationRequest(
        @NotNull
        UUID productId,

        @NotNull
        UUID shelfSectionId) {
}
