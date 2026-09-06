package com.marketmap.backend.product;

import java.time.Instant;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        String name,
        String sku,
        String brand,
        Instant createdAt) {

    static ProductResponse from(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getSku(),
                product.getBrand(),
                product.getCreatedAt());
    }
}
