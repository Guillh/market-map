package com.marketmap.backend.search;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/products")
    public List<ProductSearchResult> searchProducts(
            @RequestParam String query,
            @RequestParam(required = false) UUID storeId) {
        return searchService.searchProducts(query, storeId);
    }
}
