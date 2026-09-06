package com.marketmap.backend.product;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.marketmap.backend.shelf.ShelfSection;
import com.marketmap.backend.shelf.ShelfSectionNotFoundException;
import com.marketmap.backend.shelf.ShelfSectionRepository;

@Service
@Transactional(readOnly = true)
public class ProductLocationService {

    private final ProductLocationRepository productLocationRepository;
    private final ProductRepository productRepository;
    private final ShelfSectionRepository shelfSectionRepository;

    ProductLocationService(
            ProductLocationRepository productLocationRepository,
            ProductRepository productRepository,
            ShelfSectionRepository shelfSectionRepository) {
        this.productLocationRepository = productLocationRepository;
        this.productRepository = productRepository;
        this.shelfSectionRepository = shelfSectionRepository;
    }

    public List<ProductLocationResponse> findAll() {
        return productLocationRepository.findAll().stream().map(ProductLocationResponse::from).toList();
    }

    public ProductLocationResponse findById(UUID id) {
        return ProductLocationResponse.from(getProductLocation(id));
    }

    @Transactional
    public ProductLocationResponse create(ProductLocationRequest request) {
        Product product = getProduct(request.productId());
        ShelfSection shelfSection = getShelfSection(request.shelfSectionId());
        ProductLocation location = new ProductLocation(product, shelfSection);
        return ProductLocationResponse.from(productLocationRepository.save(location));
    }

    @Transactional
    public ProductLocationResponse update(UUID id, ProductLocationRequest request) {
        ProductLocation location = getProductLocation(id);
        Product product = getProduct(request.productId());
        ShelfSection shelfSection = getShelfSection(request.shelfSectionId());
        location.update(product, shelfSection);
        return ProductLocationResponse.from(location);
    }

    @Transactional
    public void delete(UUID id) {
        productLocationRepository.delete(getProductLocation(id));
    }

    private ProductLocation getProductLocation(UUID id) {
        return productLocationRepository.findById(id).orElseThrow(() -> new ProductLocationNotFoundException(id));
    }

    private Product getProduct(UUID id) {
        return productRepository.findById(id).orElseThrow(() -> new ProductNotFoundException(id));
    }

    private ShelfSection getShelfSection(UUID id) {
        return shelfSectionRepository.findById(id).orElseThrow(() -> new ShelfSectionNotFoundException(id));
    }
}
