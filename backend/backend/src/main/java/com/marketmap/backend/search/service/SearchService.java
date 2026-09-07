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
}
