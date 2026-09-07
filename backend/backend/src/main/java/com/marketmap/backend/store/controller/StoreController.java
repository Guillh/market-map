package com.marketmap.backend.store.controller;

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

import com.marketmap.backend.store.dto.StoreRequest;
import com.marketmap.backend.store.dto.StoreResponse;
import com.marketmap.backend.store.service.StoreService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/stores")
public class StoreController {

    private final StoreService storeService;

    StoreController(StoreService storeService) {
        this.storeService = storeService;
    }

    @GetMapping
    public List<StoreResponse> findAll() {
        return storeService.findAll();
    }

    @GetMapping("/{id}")
    public StoreResponse findById(@PathVariable UUID id) {
        return storeService.findById(id);
    }

    @PostMapping
    public ResponseEntity<StoreResponse> create(@Valid @RequestBody StoreRequest request) {
        StoreResponse response = storeService.create(request);
        return ResponseEntity
                .created(URI.create("/api/stores/" + response.id()))
                .body(response);
    }

    @PutMapping("/{id}")
    public StoreResponse update(@PathVariable UUID id, @Valid @RequestBody StoreRequest request) {
        return storeService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        storeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
