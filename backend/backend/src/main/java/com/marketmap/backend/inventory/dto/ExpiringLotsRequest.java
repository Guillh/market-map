package com.marketmap.backend.inventory.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record ExpiringLotsRequest(
        @Min(1)
        @Max(365)
        Integer days) {
}
