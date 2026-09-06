package com.marketmap.backend.product.exception;

import com.marketmap.backend.product.Product;

import java.util.UUID;

public class ProductLocationNotFoundException extends RuntimeException {

    public ProductLocationNotFoundException(UUID id) {
        super("Product location not found: " + id);
    }
}
