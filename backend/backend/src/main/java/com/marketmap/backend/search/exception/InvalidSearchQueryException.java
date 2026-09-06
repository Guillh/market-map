package com.marketmap.backend.search.exception;

public class InvalidSearchQueryException extends RuntimeException {

    public InvalidSearchQueryException() {
        super("Search query must not be blank");
    }
}
