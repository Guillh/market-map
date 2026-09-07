package com.marketmap.backend.layout;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class BoundaryVertex {
    @Column(name = "x_cm", nullable = false)
    private int x;
    @Column(name = "y_cm", nullable = false)
    private int y;

    protected BoundaryVertex() {}
    public BoundaryVertex(int x, int y) { this.x = x; this.y = y; }
    public int getX() { return x; }
    public int getY() { return y; }
}