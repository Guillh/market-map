package com.marketmap.backend.shelf.controller;

import com.marketmap.backend.shelf.service.ShelfService;

import com.marketmap.backend.shelf.dto.ShelfResponse;

import com.marketmap.backend.shelf.dto.ShelfRequest;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/shelves")
public class ShelfController {

    private final ShelfService shelfService;

    ShelfController(ShelfService shelfService) {
        this.shelfService = shelfService;
    }

    @GetMapping
    public List<ShelfResponse> findAll(@RequestParam(required = false) UUID layoutId) {
        return shelfService.findAll(layoutId);
    }

    @GetMapping("/{id}")
    public ShelfResponse findById(@PathVariable UUID id) {
        return shelfService.findById(id);
    }

    @PostMapping
    public ResponseEntity<ShelfResponse> create(@Valid @RequestBody ShelfRequest request) {
        ShelfResponse response = shelfService.create(request);
        return ResponseEntity.created(URI.create("/api/shelves/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public ShelfResponse update(@PathVariable UUID id, @Valid @RequestBody ShelfRequest request) {
        return shelfService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        shelfService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
