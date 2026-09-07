package com.marketmap.backend.product;

import java.time.Instant;
import java.util.UUID;

import com.marketmap.backend.shelf.ShelfSection;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "product_locations")
public class ProductLocation {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "shelf_section_id", nullable = false)
    private ShelfSection shelfSection;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected ProductLocation() {
    }

    public ProductLocation(Product product, ShelfSection shelfSection) {
        this.product = product;
        this.shelfSection = shelfSection;
    }

    public void update(Product product, ShelfSection shelfSection) {
        this.product = product;
        this.shelfSection = shelfSection;
    }

    public UUID getId() {
        return id;
    }

    public Product getProduct() {
        return product;
    }

    public ShelfSection getShelfSection() {
        return shelfSection;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
