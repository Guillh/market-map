package com.marketmap.backend.search.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.marketmap.backend.search.dto.ProductSearchResult;
import com.marketmap.backend.search.exception.InvalidSearchQueryException;
import com.marketmap.backend.search.repository.ProductSearchRepository;

@Service
@Transactional(readOnly = true)
public class SearchService {

    private final ProductSearchRepository productSearchRepository;

    SearchService(ProductSearchRepository productSearchRepository) {
        this.productSearchRepository = productSearchRepository;
    }

    public List<ProductSearchResult> searchProducts(String query, UUID storeId) {
        if (query == null || query.isBlank()) {
            throw new InvalidSearchQueryException();
        }

        return productSearchRepository.searchProducts(query.trim(), storeId);
    }

    public List<com.marketmap.backend.search.dto.ProductSuggestion> suggestions(String query, UUID layoutId) {
        if (query == null || query.isBlank()) throw new InvalidSearchQueryException();
        var products = productSearchRepository.suggestions(query.trim(), layoutId, org.springframework.data.domain.PageRequest.of(0, 30));
        if (products.isEmpty()) return List.of();
        var locations = productSearchRepository.locationsForProducts(products.stream().map(com.marketmap.backend.product.Product::getId).toList(), layoutId);
        return products.stream().map(p -> new com.marketmap.backend.search.dto.ProductSuggestion(
            p.getId(), p.getName(), p.getSku(), p.getBrand(),
            locations.stream().filter(r -> r.productId().equals(p.getId()))
                .map(com.marketmap.backend.search.dto.ProductSearchResult::location)
                .filter(l -> layoutId == null || l.layoutId().equals(layoutId)).toList()
        )).toList();
    }}
