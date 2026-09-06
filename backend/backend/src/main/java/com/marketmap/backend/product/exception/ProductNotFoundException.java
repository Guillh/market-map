package com.marketmap.backend.product.exception;

import com.marketmap.backend.product.Product;

import java.util.UUID;

public class ProductNotFoundException extends RuntimeException {

    public ProductNotFoundException(UUID id) {
        super("Product not found: " + id);
    }
}
