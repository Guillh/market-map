package com.marketmap.backend.product.controller;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.marketmap.backend.product.dto.ProductLocationRequest;
import com.marketmap.backend.product.dto.ProductLocationResponse;
import com.marketmap.backend.product.service.ProductLocationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/product-locations")
public class ProductLocationController {

    private final ProductLocationService productLocationService;

    ProductLocationController(ProductLocationService productLocationService) {
        this.productLocationService = productLocationService;
    }

    @GetMapping
    public List<ProductLocationResponse> findAll() {
        return productLocationService.findAll();
    }

    @GetMapping("/{id}")
    public ProductLocationResponse findById(@PathVariable UUID id) {
        return productLocationService.findById(id);
    }

    @PostMapping
    public ResponseEntity<ProductLocationResponse> create(@Valid @RequestBody ProductLocationRequest request) {
        ProductLocationResponse response = productLocationService.create(request);
        return ResponseEntity.created(URI.create("/api/product-locations/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public ProductLocationResponse update(@PathVariable UUID id, @Valid @RequestBody ProductLocationRequest request) {
        return productLocationService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        productLocationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
