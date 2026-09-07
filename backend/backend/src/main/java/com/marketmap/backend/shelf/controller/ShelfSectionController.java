package com.marketmap.backend.shelf.controller;

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

import com.marketmap.backend.shelf.dto.ShelfSectionRequest;
import com.marketmap.backend.shelf.dto.ShelfSectionResponse;
import com.marketmap.backend.shelf.service.ShelfSectionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/shelf-sections")
public class ShelfSectionController {

    private final ShelfSectionService shelfSectionService;

    ShelfSectionController(ShelfSectionService shelfSectionService) {
        this.shelfSectionService = shelfSectionService;
    }

    @GetMapping
    public List<ShelfSectionResponse> findAll(@RequestParam(required = false) UUID shelfId) {
        return shelfSectionService.findAll(shelfId);
    }

    @GetMapping("/{id}")
    public ShelfSectionResponse findById(@PathVariable UUID id) {
        return shelfSectionService.findById(id);
    }

    @PostMapping
    public ResponseEntity<ShelfSectionResponse> create(@Valid @RequestBody ShelfSectionRequest request) {
        ShelfSectionResponse response = shelfSectionService.create(request);
        return ResponseEntity.created(URI.create("/api/shelf-sections/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public ShelfSectionResponse update(@PathVariable UUID id, @Valid @RequestBody ShelfSectionRequest request) {
        return shelfSectionService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        shelfSectionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
