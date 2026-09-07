package com.marketmap.backend.shared.web;

import java.time.Instant;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import com.marketmap.backend.inventory.exception.InsufficientInventoryException;
import com.marketmap.backend.inventory.exception.InventoryItemNotFoundException;
import com.marketmap.backend.inventory.exception.InventoryLotNotFoundException;
import com.marketmap.backend.layout.exception.LayoutNotFoundException;
import com.marketmap.backend.product.exception.ProductLocationNotFoundException;
import com.marketmap.backend.product.exception.ProductNotFoundException;
import com.marketmap.backend.search.exception.InvalidSearchQueryException;
import com.marketmap.backend.shelf.exception.ShelfNotFoundException;
import com.marketmap.backend.shelf.exception.ShelfSectionNotFoundException;
import com.marketmap.backend.store.exception.StoreNotFoundException;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler({
            StoreNotFoundException.class,
            LayoutNotFoundException.class,
            InventoryItemNotFoundException.class,
            InventoryLotNotFoundException.class,
            ShelfNotFoundException.class,
            ShelfSectionNotFoundException.class,
            ProductNotFoundException.class,
            ProductLocationNotFoundException.class
    })
    ResponseEntity<ApiErrorResponse> handleNotFound(RuntimeException exception) {
        return build(HttpStatus.NOT_FOUND, exception.getMessage());
    }

    @ExceptionHandler(InsufficientInventoryException.class)
    ResponseEntity<ApiErrorResponse> handleInsufficientInventory(InsufficientInventoryException exception) {
        return build(HttpStatus.BAD_REQUEST, exception.getMessage());
    }

    @ExceptionHandler(InvalidSearchQueryException.class)
    ResponseEntity<ApiErrorResponse> handleInvalidSearchQuery(InvalidSearchQueryException exception) {
        return build(HttpStatus.BAD_REQUEST, exception.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getField() + " " + error.getDefaultMessage())
                .orElse("Invalid request");
        return build(HttpStatus.BAD_REQUEST, message);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ApiErrorResponse> handleDataIntegrity(DataIntegrityViolationException exception) {
        return build(HttpStatus.CONFLICT, "Request conflicts with existing data");
    }

    @ExceptionHandler(NoResourceFoundException.class)
    ResponseEntity<ApiErrorResponse> handleNoResourceFound(NoResourceFoundException exception) {
        return build(HttpStatus.NOT_FOUND, "Resource not found");
    }

    private ResponseEntity<ApiErrorResponse> build(HttpStatus status, String message) {
        return ResponseEntity
                .status(status)
                .body(new ApiErrorResponse(status.value(), message, Instant.now()));
    }

    record ApiErrorResponse(int status, String message, Instant timestamp) {
    }
}
