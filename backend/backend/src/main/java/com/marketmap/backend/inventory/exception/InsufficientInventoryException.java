package com.marketmap.backend.inventory.exception;

public class InsufficientInventoryException extends RuntimeException {

    public InsufficientInventoryException() {
        super("Insufficient inventory quantity for this movement.");
    }
}
