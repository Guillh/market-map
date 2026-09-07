package com.marketmap.backend.inventory;

import java.time.Instant;
import java.util.UUID;

import com.marketmap.backend.product.ProductLocation;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "inventory_items")
public class InventoryItem {

    @Id
    @GeneratedValue
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_location_id", nullable = false)
    private ProductLocation productLocation;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "minimum_quantity", nullable = false)
    private Integer minimumQuantity;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected InventoryItem() {
    }

    public InventoryItem(ProductLocation productLocation, Integer quantity, Integer minimumQuantity) {
        this.productLocation = productLocation;
        this.quantity = quantity;
        this.minimumQuantity = minimumQuantity;
    }

    public void update(Integer quantity, Integer minimumQuantity) {
        this.quantity = quantity;
        this.minimumQuantity = minimumQuantity;
        this.updatedAt = Instant.now();
    }

    public void applyMovement(InventoryMovementType type, Integer movementQuantity) {
        if (type == InventoryMovementType.IN) {
            quantity += movementQuantity;
        } else if (type == InventoryMovementType.OUT) {
            quantity -= movementQuantity;
        } else {
            quantity = movementQuantity;
        }
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public ProductLocation getProductLocation() { return productLocation; }
    public Integer getQuantity() { return quantity; }
    public Integer getMinimumQuantity() { return minimumQuantity; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
