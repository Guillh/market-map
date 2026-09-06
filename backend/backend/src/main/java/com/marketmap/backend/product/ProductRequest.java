package com.marketmap.backend.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProductRequest(
        @NotBlank
        @Size(max = 160)
        String name,

        @Size(max = 80)
        String sku,

        @Size(max = 120)
        String brand) {
}
