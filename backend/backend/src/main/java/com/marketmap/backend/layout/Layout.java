package com.marketmap.backend.layout;

import java.time.Instant;
import java.util.UUID;

import com.marketmap.backend.store.Store;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "layouts")
public class Layout {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "width_cm", nullable = false)
    private Integer widthCm;

    @Column(name = "height_cm", nullable = false)
    private Integer heightCm;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Layout() {
    }

    public Layout(Store store, String name, Integer widthCm, Integer heightCm) {
        this.store = store;
        this.name = name;
        this.widthCm = widthCm;
        this.heightCm = heightCm;
    }

    public UUID getId() {
        return id;
    }

    public Store getStore() {
        return store;
    }

    public String getName() {
        return name;
    }

    public Integer getWidthCm() {
        return widthCm;
    }

    public Integer getHeightCm() {
        return heightCm;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
