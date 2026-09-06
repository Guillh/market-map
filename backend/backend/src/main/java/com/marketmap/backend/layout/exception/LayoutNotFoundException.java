package com.marketmap.backend.layout.exception;

import com.marketmap.backend.layout.Layout;

import java.util.UUID;

public class LayoutNotFoundException extends RuntimeException {

    public LayoutNotFoundException(UUID id) {
        super("Layout not found: " + id);
    }
}
