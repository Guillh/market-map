package com.marketmap.backend.layout.controller;

import com.marketmap.backend.layout.service.LayoutService;

import com.marketmap.backend.layout.dto.LayoutResponse;

import com.marketmap.backend.layout.dto.LayoutRequest;

import com.marketmap.backend.layout.Layout;

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
@RequestMapping("/api/layouts")
public class LayoutController {

    private final LayoutService layoutService;

    LayoutController(LayoutService layoutService) {
        this.layoutService = layoutService;
    }

    @GetMapping
    public List<LayoutResponse> findAll(@RequestParam(required = false) UUID storeId) {
        return layoutService.findAll(storeId);
    }

    @GetMapping("/{id}")
    public LayoutResponse findById(@PathVariable UUID id) {
        return layoutService.findById(id);
    }

    @PostMapping
    public ResponseEntity<LayoutResponse> create(@Valid @RequestBody LayoutRequest request) {
        LayoutResponse response = layoutService.create(request);
        return ResponseEntity.created(URI.create("/api/layouts/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public LayoutResponse update(@PathVariable UUID id, @Valid @RequestBody LayoutRequest request) {
        return layoutService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        layoutService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
