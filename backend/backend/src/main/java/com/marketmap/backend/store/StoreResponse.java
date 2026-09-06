package com.marketmap.backend.store;

import java.time.Instant;
import java.util.UUID;

public record StoreResponse(
        UUID id,
        String name,
        String description,
        Instant createdAt) {

    static StoreResponse from(Store store) {
        return new StoreResponse(
                store.getId(),
                store.getName(),
                store.getDescription(),
                store.getCreatedAt());
    }
}
