package com.marketmap.backend.search;

public class InvalidSearchQueryException extends RuntimeException {

    public InvalidSearchQueryException() {
        super("Search query must not be blank");
    }
}
