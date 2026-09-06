package com.marketmap.backend.product;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, length = 160)
    private String name;

    @Column(unique = true, length = 80)
    private String sku;

    @Column(length = 120)
    private String brand;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Product() {
    }

    public Product(String name, String sku, String brand) {
        this.name = name;
        this.sku = sku;
        this.brand = brand;
    }

    public void update(String name, String sku, String brand) {
        this.name = name;
        this.sku = sku;
        this.brand = brand;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getSku() {
        return sku;
    }

    public String getBrand() {
        return brand;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}

