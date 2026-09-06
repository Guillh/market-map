package com.marketmap.backend.search;

import java.util.UUID;

public record ProductSearchLocation(
        UUID storeId,
        String storeName,
        UUID layoutId,
        String layoutName,
        Integer layoutWidthCm,
        Integer layoutHeightCm,
        UUID shelfId,
        String shelfName,
        Integer shelfPositionXCm,
        Integer shelfPositionYCm,
        Integer shelfWidthCm,
        Integer shelfHeightCm,
        UUID shelfSectionId,
        String shelfSectionName,
        Integer levelIndex,
        Integer positionIndex) {
}
