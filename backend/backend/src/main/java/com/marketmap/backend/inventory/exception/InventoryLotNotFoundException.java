package com.marketmap.backend.inventory.exception;

import java.util.UUID;

public class InventoryLotNotFoundException extends RuntimeException {

    public InventoryLotNotFoundException(UUID id) {
        super("Inventory lot not found: " + id);
    }
}
