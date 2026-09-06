package com.marketmap.backend.store;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StoreRequest(
        @NotBlank
        @Size(max = 120)
        String name,

        @Size(max = 255)
        String description) {
}
