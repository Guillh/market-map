package com.marketmap.backend.product;

import java.util.UUID;

public class ProductLocationNotFoundException extends RuntimeException {

    public ProductLocationNotFoundException(UUID id) {
        super("Product location not found: " + id);
    }
}
