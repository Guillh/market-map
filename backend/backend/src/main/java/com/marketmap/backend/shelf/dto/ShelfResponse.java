package com.marketmap.backend.shelf.dto;

import java.time.Instant;
import java.util.UUID;

import com.marketmap.backend.shelf.Shelf;

public record ShelfResponse(
        UUID id,
        UUID layoutId,
        String name,
        Integer positionXCm,
        Integer positionYCm,
        Integer widthCm,
        Integer heightCm,
        Instant createdAt) {
    public static ShelfResponse from(Shelf shelf) {
        return new ShelfResponse(
                shelf.getId(),
                shelf.getLayout().getId(),
                shelf.getName(),
                shelf.getPositionXCm(),
                shelf.getPositionYCm(),
                shelf.getWidthCm(),
                shelf.getHeightCm(),
                shelf.getCreatedAt());
    }
}
