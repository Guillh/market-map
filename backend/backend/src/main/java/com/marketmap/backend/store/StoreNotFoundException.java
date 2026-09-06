package com.marketmap.backend.store;

import java.util.UUID;

public class StoreNotFoundException extends RuntimeException {

    public StoreNotFoundException(UUID id) {
        super("Store not found: " + id);
    }
}

