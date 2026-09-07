package com.marketmap.backend.layout.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record LayoutRequest(
        @NotNull
        UUID storeId,

        @NotBlank
        @Size(max = 120)
        String name,

        @NotNull
        @Positive
        Integer widthCm,

        @NotNull
        @Positive
        Integer heightCm,
        @Size(max = 60) java.util.List<@jakarta.validation.Valid @NotNull LayoutVertex> boundary) {
}
