package com.marketmap.backend.shelf;

import java.util.UUID;

public class ShelfNotFoundException extends RuntimeException {

    public ShelfNotFoundException(UUID id) {
        super("Shelf not found: " + id);
    }
}
