package com.marketmap.backend.shelf;

import java.time.Instant;
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
@Table(name = "shelf_sections")
public class ShelfSection {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "shelf_id", nullable = false)
    private Shelf shelf;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "level_index", nullable = false)
    private Integer levelIndex;

    @Column(name = "position_index", nullable = false)
    private Integer positionIndex;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected ShelfSection() {
    }

    public ShelfSection(Shelf shelf, String name, Integer levelIndex, Integer positionIndex) {
        this.shelf = shelf;
        this.name = name;
        this.levelIndex = levelIndex;
        this.positionIndex = positionIndex;
    }

    public UUID getId() {
        return id;
    }

    public Shelf getShelf() {
        return shelf;
    }

    public String getName() {
        return name;
    }

    public Integer getLevelIndex() {
        return levelIndex;
    }

    public Integer getPositionIndex() {
        return positionIndex;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
