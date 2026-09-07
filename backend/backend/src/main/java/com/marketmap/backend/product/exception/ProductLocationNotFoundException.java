package com.marketmap.backend.product.exception;

import java.util.UUID;

import com.marketmap.backend.product.Product;

public class ProductLocationNotFoundException extends RuntimeException {

    public ProductLocationNotFoundException(UUID id) {
        super("Product location not found: " + id);
    }
}
