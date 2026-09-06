package com.marketmap.backend.layout;

import java.time.Instant;
import java.util.UUID;

public record LayoutResponse(
        UUID id,
        UUID storeId,
        String name,
        Integer widthCm,
        Integer heightCm,
        Instant createdAt) {

    static LayoutResponse from(Layout layout) {
        return new LayoutResponse(
                layout.getId(),
                layout.getStore().getId(),
                layout.getName(),
                layout.getWidthCm(),
                layout.getHeightCm(),
                layout.getCreatedAt());
    }
}
