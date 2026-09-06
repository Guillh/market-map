package com.marketmap.backend.shelf.dto;

import com.marketmap.backend.shelf.ShelfSection;

import java.time.Instant;
import java.util.UUID;

public record ShelfSectionResponse(
        UUID id,
        UUID shelfId,
        String name,
        Integer levelIndex,
        Integer positionIndex,
        Instant createdAt) {
    public static ShelfSectionResponse from(ShelfSection section) {
        return new ShelfSectionResponse(
                section.getId(),
                section.getShelf().getId(),
                section.getName(),
                section.getLevelIndex(),
                section.getPositionIndex(),
                section.getCreatedAt());
    }
}
