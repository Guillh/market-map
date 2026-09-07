package com.marketmap.backend.layout.dto;

import jakarta.validation.constraints.Min;

public record LayoutVertex(@Min(0) int x, @Min(0) int y) {}