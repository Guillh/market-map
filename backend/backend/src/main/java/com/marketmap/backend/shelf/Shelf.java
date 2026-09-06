package com.marketmap.backend.shelf;

import java.time.Instant;
import java.util.UUID;

import com.marketmap.backend.layout.Layout;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "shelves")
public class Shelf {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "layout_id", nullable = false)
    private Layout layout;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "position_x_cm", nullable = false)
    private Integer positionXCm;

    @Column(name = "position_y_cm", nullable = false)
    private Integer positionYCm;

    @Column(name = "width_cm", nullable = false)
    private Integer widthCm;

    @Column(name = "height_cm", nullable = false)
    private Integer heightCm;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Shelf() {
    }

    public Shelf(Layout layout, String name, Integer positionXCm, Integer positionYCm, Integer widthCm, Integer heightCm) {
        this.layout = layout;
        this.name = name;
        this.positionXCm = positionXCm;
        this.positionYCm = positionYCm;
        this.widthCm = widthCm;
        this.heightCm = heightCm;
    }

    public UUID getId() {
        return id;
    }

    public Layout getLayout() {
        return layout;
    }

    public String getName() {
        return name;
    }

    public Integer getPositionXCm() {
        return positionXCm;
    }

    public Integer getPositionYCm() {
        return positionYCm;
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
