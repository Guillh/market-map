package com.marketmap.backend.product.dto;

import com.marketmap.backend.product.ProductLocation;

import com.marketmap.backend.product.Product;

import java.time.Instant;
import java.util.UUID;

public record ProductLocationResponse(
        UUID id,
        UUID productId,
        UUID shelfSectionId,
        Instant createdAt) {
    public static ProductLocationResponse from(ProductLocation location) {
        return new ProductLocationResponse(
                location.getId(),
                location.getProduct().getId(),
                location.getShelfSection().getId(),
                location.getCreatedAt());
    }
}
