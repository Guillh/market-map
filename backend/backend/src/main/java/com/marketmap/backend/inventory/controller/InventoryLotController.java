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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.marketmap.backend.inventory.dto.InventoryLotRequest;
import com.marketmap.backend.inventory.dto.InventoryLotResponse;
import com.marketmap.backend.inventory.service.InventoryLotService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@RestController
@RequestMapping("/api/inventory/lots")
public class InventoryLotController {

    private final InventoryLotService inventoryLotService;

    InventoryLotController(InventoryLotService inventoryLotService) {
        this.inventoryLotService = inventoryLotService;
    }

    @GetMapping
    public List<InventoryLotResponse> findAll(@RequestParam(required = false) UUID inventoryItemId) {
        return inventoryLotService.findAll(inventoryItemId);
    }

    @GetMapping("/expiring")
    public List<InventoryLotResponse> findExpiringLots(
            @RequestParam(required = false) @Min(1) @Max(365) Integer days) {
        return inventoryLotService.findExpiringLots(days);
    }

    @GetMapping("/{id}")
    public InventoryLotResponse findById(@PathVariable UUID id) {
        return inventoryLotService.findById(id);
    }

    @PostMapping
    public ResponseEntity<InventoryLotResponse> create(@Valid @RequestBody InventoryLotRequest request) {
        InventoryLotResponse response = inventoryLotService.create(request);
        return ResponseEntity.created(URI.create("/api/inventory/lots/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public InventoryLotResponse update(@PathVariable UUID id, @Valid @RequestBody InventoryLotRequest request) {
        return inventoryLotService.update(id, request);
    }
}
