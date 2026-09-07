package com.marketmap.backend.inventory;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "inventory_lots")
public class InventoryLot {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "inventory_item_id", nullable = false)
    private InventoryItem inventoryItem;

    @Column(name = "lot_code", nullable = false, length = 120)
    private String lotCode;

    @Column(name = "expiration_date")
    private LocalDate expirationDate;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected InventoryLot() {
    }

    public InventoryLot(InventoryItem inventoryItem, String lotCode, LocalDate expirationDate, Integer quantity) {
        this.inventoryItem = inventoryItem;
        this.lotCode = lotCode;
        this.expirationDate = expirationDate;
        this.quantity = quantity;
    }

    public void update(String lotCode, LocalDate expirationDate, Integer quantity) {
        this.lotCode = lotCode;
        this.expirationDate = expirationDate;
        this.quantity = quantity;
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public InventoryItem getInventoryItem() { return inventoryItem; }
    public String getLotCode() { return lotCode; }
    public LocalDate getExpirationDate() { return expirationDate; }
    public Integer getQuantity() { return quantity; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
