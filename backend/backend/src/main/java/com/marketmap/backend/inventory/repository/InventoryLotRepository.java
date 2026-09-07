package com.marketmap.backend.inventory.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.marketmap.backend.inventory.InventoryLot;

public interface InventoryLotRepository extends JpaRepository<InventoryLot, UUID> {

    List<InventoryLot> findByInventoryItemId(UUID inventoryItemId);

    List<InventoryLot> findByExpirationDateBetweenOrderByExpirationDateAsc(LocalDate startDate, LocalDate endDate);
}
