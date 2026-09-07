package com.marketmap.backend.inventory.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.marketmap.backend.inventory.InventoryMovement;

public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, UUID> {

    List<InventoryMovement> findByProductLocationIdOrderByCreatedAtDesc(UUID productLocationId);
}
