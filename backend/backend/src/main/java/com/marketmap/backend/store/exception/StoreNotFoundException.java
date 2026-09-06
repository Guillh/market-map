package com.marketmap.backend.store.exception;

import com.marketmap.backend.store.Store;

import java.util.UUID;

public class StoreNotFoundException extends RuntimeException {

    public StoreNotFoundException(UUID id) {
        super("Store not found: " + id);
    }
}
