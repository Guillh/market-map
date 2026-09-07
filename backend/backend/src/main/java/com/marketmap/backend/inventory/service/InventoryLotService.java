package com.marketmap.backend.inventory.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.marketmap.backend.inventory.InventoryItem;
import com.marketmap.backend.inventory.InventoryLot;
import com.marketmap.backend.inventory.dto.InventoryLotRequest;
import com.marketmap.backend.inventory.dto.InventoryLotResponse;
import com.marketmap.backend.inventory.exception.InventoryItemNotFoundException;
import com.marketmap.backend.inventory.exception.InventoryLotNotFoundException;
import com.marketmap.backend.inventory.repository.InventoryItemRepository;
import com.marketmap.backend.inventory.repository.InventoryLotRepository;

@Service
@Transactional(readOnly = true)
public class InventoryLotService {

    private final InventoryLotRepository inventoryLotRepository;
    private final InventoryItemRepository inventoryItemRepository;

    InventoryLotService(InventoryLotRepository inventoryLotRepository, InventoryItemRepository inventoryItemRepository) {
        this.inventoryLotRepository = inventoryLotRepository;
        this.inventoryItemRepository = inventoryItemRepository;
    }

    public List<InventoryLotResponse> findAll(UUID inventoryItemId) {
        List<InventoryLot> lots = inventoryItemId == null
                ? inventoryLotRepository.findAll()
                : inventoryLotRepository.findByInventoryItemId(inventoryItemId);
        return lots.stream().map(InventoryLotResponse::from).toList();
    }

    public List<InventoryLotResponse> findExpiringLots(Integer days) {
        int periodInDays = days == null ? 30 : days;
        LocalDate today = LocalDate.now();
        return inventoryLotRepository.findByExpirationDateBetweenOrderByExpirationDateAsc(today, today.plusDays(periodInDays))
                .stream()
                .map(InventoryLotResponse::from)
                .toList();
    }

    public InventoryLotResponse findById(UUID id) {
        return InventoryLotResponse.from(getInventoryLot(id));
    }

    @Transactional
    public InventoryLotResponse create(InventoryLotRequest request) {
        InventoryItem item = getInventoryItem(request.inventoryItemId());
        InventoryLot lot = new InventoryLot(item, request.lotCode(), request.expirationDate(), request.quantity());
        return InventoryLotResponse.from(inventoryLotRepository.save(lot));
    }

    @Transactional
    public InventoryLotResponse update(UUID id, InventoryLotRequest request) {
        InventoryLot lot = getInventoryLot(id);
        InventoryItem item = getInventoryItem(request.inventoryItemId());
        if (!lot.getInventoryItem().getId().equals(item.getId())) {
            throw new IllegalArgumentException("Inventory item cannot be changed for an existing lot.");
        }
        lot.update(request.lotCode(), request.expirationDate(), request.quantity());
        return InventoryLotResponse.from(lot);
    }

    private InventoryLot getInventoryLot(UUID id) {
        return inventoryLotRepository.findById(id).orElseThrow(() -> new InventoryLotNotFoundException(id));
    }

    private InventoryItem getInventoryItem(UUID id) {
        return inventoryItemRepository.findById(id).orElseThrow(() -> new InventoryItemNotFoundException(id));
    }
}
