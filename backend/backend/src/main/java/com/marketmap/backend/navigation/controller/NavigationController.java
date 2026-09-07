package com.marketmap.backend.navigation.controller;

import java.util.*;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import com.marketmap.backend.navigation.dto.NavigationElement;
import com.marketmap.backend.navigation.service.NavigationService;
import com.marketmap.backend.navigation.service.PathFinder.Route;

@RestController
@RequestMapping("/api/navigation")
public class NavigationController {
    private final NavigationService service;
    public NavigationController(NavigationService service) { this.service = service; }
    @GetMapping("/elements")
    public List<NavigationElement> list() { return service.list(); }
    @PostMapping("/elements")
    @ResponseStatus(HttpStatus.CREATED)
    public NavigationElement create(@Valid @RequestBody NavigationElement body) { return service.save(null,body); }
    @PutMapping("/elements/{id}")
    public NavigationElement update(@PathVariable UUID id, @Valid @RequestBody NavigationElement body) { return service.save(id,body); }
    @DeleteMapping("/elements/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) { service.delete(id); }
    @GetMapping("/route")
    public Route route(@RequestParam UUID terminalId, @RequestParam UUID shelfId) { return service.route(terminalId,shelfId); }
}