package com.marketmap.backend.search.dto;

import java.util.UUID;

public record ProductSearchResult(
        UUID productId,
        String productName,
        String sku,
        String brand,
        ProductSearchLocation location) {
}
