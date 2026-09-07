package com.marketmap.backend.inventory;

import java.time.Instant;
import java.util.UUID;

import com.marketmap.backend.product.ProductLocation;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "inventory_movements")
public class InventoryMovement {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_location_id", nullable = false)
    private ProductLocation productLocation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InventoryMovementType type;

    @Column(nullable = false)
    private Integer quantity;

    @Column(length = 255)
    private String reason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected InventoryMovement() {
    }

    public InventoryMovement(ProductLocation productLocation, InventoryMovementType type, Integer quantity, String reason) {
        this.productLocation = productLocation;
        this.type = type;
        this.quantity = quantity;
        this.reason = reason;
    }

    public UUID getId() { return id; }
    public ProductLocation getProductLocation() { return productLocation; }
    public InventoryMovementType getType() { return type; }
    public Integer getQuantity() { return quantity; }
    public String getReason() { return reason; }
    public Instant getCreatedAt() { return createdAt; }
}
