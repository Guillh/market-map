package com.marketmap.backend.product.dto;

import java.time.Instant;
import java.util.UUID;

import com.marketmap.backend.product.ProductLocation;

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
