CREATE TABLE layout_vertices (
 layout_id UUID NOT NULL REFERENCES layouts(id) ON DELETE CASCADE,
 vertex_order INTEGER NOT NULL,
 x_cm INTEGER NOT NULL CHECK (x_cm >= 0),
 y_cm INTEGER NOT NULL CHECK (y_cm >= 0),
 PRIMARY KEY (layout_id, vertex_order)
);