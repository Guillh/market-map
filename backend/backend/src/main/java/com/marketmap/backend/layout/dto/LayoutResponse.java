package com.marketmap.backend.layout.dto;

import com.marketmap.backend.layout.Layout;

import java.time.Instant;
import java.util.UUID;

public record LayoutResponse(
        UUID id,
        UUID storeId,
        String name,
        Integer widthCm,
        Integer heightCm,
        Instant createdAt) {
    public static LayoutResponse from(Layout layout) {
        return new LayoutResponse(
                layout.getId(),
                layout.getStore().getId(),
                layout.getName(),
                layout.getWidthCm(),
                layout.getHeightCm(),
                layout.getCreatedAt());
    }
}
