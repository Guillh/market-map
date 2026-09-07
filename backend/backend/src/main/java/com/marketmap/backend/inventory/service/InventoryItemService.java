package com.marketmap.backend.inventory.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.marketmap.backend.inventory.InventoryItem;
import com.marketmap.backend.inventory.dto.InventoryItemRequest;
import com.marketmap.backend.inventory.dto.InventoryItemResponse;
import com.marketmap.backend.inventory.exception.InventoryItemNotFoundException;
import com.marketmap.backend.inventory.repository.InventoryItemRepository;
import com.marketmap.backend.product.ProductLocation;
import com.marketmap.backend.product.exception.ProductLocationNotFoundException;
import com.marketmap.backend.product.repository.ProductLocationRepository;

@Service
@Transactional(readOnly = true)
public class InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;
    private final ProductLocationRepository productLocationRepository;

    InventoryItemService(InventoryItemRepository inventoryItemRepository, ProductLocationRepository productLocationRepository) {
        this.inventoryItemRepository = inventoryItemRepository;
        this.productLocationRepository = productLocationRepository;
    }

    public List<InventoryItemResponse> findAll() {
        return inventoryItemRepository.findAll().stream().map(InventoryItemResponse::from).toList();
    }

    public InventoryItemResponse findById(UUID id) {
        return InventoryItemResponse.from(getInventoryItem(id));
    }

    @Transactional
    public InventoryItemResponse create(InventoryItemRequest request) {
        ProductLocation productLocation = getProductLocation(request.productLocationId());
        InventoryItem item = new InventoryItem(productLocation, request.quantity(), request.minimumQuantity());
        return InventoryItemResponse.from(inventoryItemRepository.save(item));
    }

    @Transactional
    public InventoryItemResponse update(UUID id, InventoryItemRequest request) {
        InventoryItem item = getInventoryItem(id);
        if (!item.getProductLocation().getId().equals(request.productLocationId())) {
            throw new IllegalArgumentException("Product location cannot be changed for an existing inventory item.");
        }
        item.update(request.quantity(), request.minimumQuantity());
        return InventoryItemResponse.from(item);
    }

    InventoryItem getInventoryItem(UUID id) {
        return inventoryItemRepository.findById(id).orElseThrow(() -> new InventoryItemNotFoundException(id));
    }

    InventoryItem getInventoryItemByProductLocation(UUID productLocationId) {
        return inventoryItemRepository.findByProductLocationId(productLocationId)
                .orElseThrow(() -> new IllegalArgumentException("Inventory item not found for product location: " + productLocationId));
    }

    private ProductLocation getProductLocation(UUID id) {
        return productLocationRepository.findById(id).orElseThrow(() -> new ProductLocationNotFoundException(id));
    }
}
