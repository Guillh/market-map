package com.marketmap.backend.layout.exception;

import java.util.UUID;

import com.marketmap.backend.layout.Layout;

public class LayoutNotFoundException extends RuntimeException {

    public LayoutNotFoundException(UUID id) {
        super("Layout not found: " + id);
    }
}
