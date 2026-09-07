package com.marketmap.backend.inventory.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.marketmap.backend.inventory.InventoryItem;
import com.marketmap.backend.inventory.InventoryMovement;
import com.marketmap.backend.inventory.InventoryMovementType;
import com.marketmap.backend.inventory.dto.InventoryMovementRequest;
import com.marketmap.backend.inventory.dto.InventoryMovementResponse;
import com.marketmap.backend.inventory.exception.InsufficientInventoryException;
import com.marketmap.backend.inventory.repository.InventoryItemRepository;
import com.marketmap.backend.inventory.repository.InventoryMovementRepository;
import com.marketmap.backend.product.ProductLocation;
import com.marketmap.backend.product.exception.ProductLocationNotFoundException;
import com.marketmap.backend.product.repository.ProductLocationRepository;

@Service
@Transactional(readOnly = true)
public class InventoryMovementService {

    private final InventoryMovementRepository inventoryMovementRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final ProductLocationRepository productLocationRepository;

    InventoryMovementService(
            InventoryMovementRepository inventoryMovementRepository,
            InventoryItemRepository inventoryItemRepository,
            ProductLocationRepository productLocationRepository) {
        this.inventoryMovementRepository = inventoryMovementRepository;
        this.inventoryItemRepository = inventoryItemRepository;
        this.productLocationRepository = productLocationRepository;
    }

    public List<InventoryMovementResponse> findAll(UUID productLocationId) {
        List<InventoryMovement> movements = productLocationId == null
                ? inventoryMovementRepository.findAll()
                : inventoryMovementRepository.findByProductLocationIdOrderByCreatedAtDesc(productLocationId);
        return movements.stream().map(InventoryMovementResponse::from).toList();
    }

    @Transactional
    public InventoryMovementResponse create(InventoryMovementRequest request) {
        ProductLocation productLocation = getProductLocation(request.productLocationId());
        InventoryItem item = inventoryItemRepository.findByProductLocationId(productLocation.getId())
                .orElseGet(() -> inventoryItemRepository.save(new InventoryItem(productLocation, 0, 0)));

        if (request.type() == InventoryMovementType.OUT && item.getQuantity() < request.quantity()) {
            throw new InsufficientInventoryException();
        }

        item.applyMovement(request.type(), request.quantity());
        InventoryMovement movement = new InventoryMovement(productLocation, request.type(), request.quantity(), request.reason());
        return InventoryMovementResponse.from(inventoryMovementRepository.save(movement));
    }

    private ProductLocation getProductLocation(UUID id) {
        return productLocationRepository.findById(id).orElseThrow(() -> new ProductLocationNotFoundException(id));
    }
}
