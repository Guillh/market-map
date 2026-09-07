package com.marketmap.backend.search.dto;

import java.util.List;
import java.util.UUID;

public record ProductSuggestion(UUID productId, String productName, String sku, String brand, List<ProductSearchLocation> locations) {}