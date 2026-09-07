package com.marketmap.backend.inventory.controller;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.marketmap.backend.inventory.dto.InventoryMovementRequest;
import com.marketmap.backend.inventory.dto.InventoryMovementResponse;
import com.marketmap.backend.inventory.service.InventoryMovementService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/inventory/movements")
public class InventoryMovementController {

    private final InventoryMovementService inventoryMovementService;

    InventoryMovementController(InventoryMovementService inventoryMovementService) {
        this.inventoryMovementService = inventoryMovementService;
    }

    @GetMapping
    public List<InventoryMovementResponse> findAll(@RequestParam(required = false) UUID productLocationId) {
        return inventoryMovementService.findAll(productLocationId);
    }

    @PostMapping
    public ResponseEntity<InventoryMovementResponse> create(@Valid @RequestBody InventoryMovementRequest request) {
        InventoryMovementResponse response = inventoryMovementService.create(request);
        return ResponseEntity.created(URI.create("/api/inventory/movements/" + response.id())).body(response);
    }
}
