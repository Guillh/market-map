package com.marketmap.backend.shelf;

import java.util.UUID;

public class ShelfSectionNotFoundException extends RuntimeException {

    public ShelfSectionNotFoundException(UUID id) {
        super("Shelf section not found: " + id);
    }
}
