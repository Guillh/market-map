package com.marketmap.backend.product.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.marketmap.backend.product.Product;
import com.marketmap.backend.product.dto.ProductRequest;
import com.marketmap.backend.product.dto.ProductResponse;
import com.marketmap.backend.product.exception.ProductNotFoundException;
import com.marketmap.backend.product.repository.ProductRepository;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductResponse> findAll() {
        return productRepository.findAll().stream().map(ProductResponse::from).toList();
    }

    public ProductResponse findById(UUID id) {
        return ProductResponse.from(getProduct(id));
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Product product = new Product(request.name(), request.sku(), request.brand());
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(UUID id, ProductRequest request) {
        Product product = getProduct(id);
        product.update(request.name(), request.sku(), request.brand());
        return ProductResponse.from(product);
    }

    @Transactional
    public void delete(UUID id) {
        productRepository.delete(getProduct(id));
    }

    private Product getProduct(UUID id) {
        return productRepository.findById(id).orElseThrow(() -> new ProductNotFoundException(id));
    }
}
