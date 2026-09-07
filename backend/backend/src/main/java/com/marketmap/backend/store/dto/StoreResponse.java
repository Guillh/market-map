package com.marketmap.backend.store.dto;

import java.time.Instant;
import java.util.UUID;

import com.marketmap.backend.store.Store;

public record StoreResponse(
        UUID id,
        String name,
        String description,
        Instant createdAt) {
    public static StoreResponse from(Store store) {
        return new StoreResponse(
                store.getId(),
                store.getName(),
                store.getDescription(),
                store.getCreatedAt());
    }
}
