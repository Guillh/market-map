package com.marketmap.backend.inventory.controller;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.marketmap.backend.inventory.dto.InventoryItemRequest;
import com.marketmap.backend.inventory.dto.InventoryItemResponse;
import com.marketmap.backend.inventory.service.InventoryItemService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/inventory/items")
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;

    InventoryItemController(InventoryItemService inventoryItemService) {
        this.inventoryItemService = inventoryItemService;
    }

    @GetMapping
    public List<InventoryItemResponse> findAll() {
        return inventoryItemService.findAll();
    }

    @GetMapping("/{id}")
    public InventoryItemResponse findById(@PathVariable UUID id) {
        return inventoryItemService.findById(id);
    }

    @PostMapping
    public ResponseEntity<InventoryItemResponse> create(@Valid @RequestBody InventoryItemRequest request) {
        InventoryItemResponse response = inventoryItemService.create(request);
        return ResponseEntity.created(URI.create("/api/inventory/items/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public InventoryItemResponse update(@PathVariable UUID id, @Valid @RequestBody InventoryItemRequest request) {
        return inventoryItemService.update(id, request);
    }
}
