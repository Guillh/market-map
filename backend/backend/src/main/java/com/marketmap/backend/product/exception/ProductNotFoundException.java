package com.marketmap.backend.product.exception;

import java.util.UUID;

import com.marketmap.backend.product.Product;

public class ProductNotFoundException extends RuntimeException {

    public ProductNotFoundException(UUID id) {
        super("Product not found: " + id);
    }
}
