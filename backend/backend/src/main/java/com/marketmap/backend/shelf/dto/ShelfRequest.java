package com.marketmap.backend.shelf.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ShelfRequest(
        @NotNull
        UUID layoutId,

        @NotBlank
        @Size(max = 120)
        String name,

        @NotNull
        @PositiveOrZero
        Integer positionXCm,

        @NotNull
        @PositiveOrZero
        Integer positionYCm,

        @NotNull
        @Positive
        Integer widthCm,

        @NotNull
        @Positive
        Integer heightCm) {
}
