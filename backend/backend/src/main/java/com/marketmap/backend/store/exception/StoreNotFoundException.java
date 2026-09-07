package com.marketmap.backend.store.exception;

import java.util.UUID;

import com.marketmap.backend.store.Store;

public class StoreNotFoundException extends RuntimeException {

    public StoreNotFoundException(UUID id) {
        super("Store not found: " + id);
    }
}
