package com.marketmap.backend.product.dto;

import com.marketmap.backend.product.Product;

import java.time.Instant;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        String name,
        String sku,
        String brand,
        Instant createdAt) {
    public static ProductResponse from(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getSku(),
                product.getBrand(),
                product.getCreatedAt());
    }
}
