package com.marketmap.backend.product;

import java.time.Instant;
import java.util.UUID;

public record ProductLocationResponse(
        UUID id,
        UUID productId,
        UUID shelfSectionId,
        Instant createdAt) {

    static ProductLocationResponse from(ProductLocation location) {
        return new ProductLocationResponse(
                location.getId(),
                location.getProduct().getId(),
                location.getShelfSection().getId(),
                location.getCreatedAt());
    }
}
