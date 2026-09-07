package com.marketmap.backend.navigation.dto;

import java.util.UUID;
import jakarta.validation.constraints.*;

public record NavigationElement(
    UUID id,
    @NotNull UUID layoutId,
    @NotNull Kind kind,
    @NotBlank @Size(max = 120) String name,
    @Min(0) int xCm,
    @Min(0) int yCm,
    @Min(0) int widthCm,
    @Min(0) int heightCm,
    UUID shelfId
) {
    public enum Kind { TERMINAL, OBSTACLE, ACCESS }
}