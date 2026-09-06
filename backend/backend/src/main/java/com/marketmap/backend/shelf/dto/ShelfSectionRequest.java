package com.marketmap.backend.shelf.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ShelfSectionRequest(
        @NotNull
        UUID shelfId,

        @NotBlank
        @Size(max = 120)
        String name,

        @NotNull
        @PositiveOrZero
        Integer levelIndex,

        @NotNull
        @PositiveOrZero
        Integer positionIndex) {
}
