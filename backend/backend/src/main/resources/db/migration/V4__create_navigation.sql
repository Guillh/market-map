CREATE TABLE navigation_elements (
 id UUID PRIMARY KEY,
 layout_id UUID NOT NULL REFERENCES layouts(id) ON DELETE CASCADE,
 kind VARCHAR(16) NOT NULL CHECK (kind IN ('TERMINAL', 'OBSTACLE', 'ACCESS')),
 name VARCHAR(120) NOT NULL,
 x_cm INTEGER NOT NULL CHECK (x_cm >= 0),
 y_cm INTEGER NOT NULL CHECK (y_cm >= 0),
 width_cm INTEGER NOT NULL DEFAULT 0 CHECK (width_cm >= 0),
 height_cm INTEGER NOT NULL DEFAULT 0 CHECK (height_cm >= 0),
 shelf_id UUID REFERENCES shelves(id) ON DELETE CASCADE,
 CHECK ((kind = 'ACCESS' AND shelf_id IS NOT NULL) OR (kind <> 'ACCESS' AND shelf_id IS NULL)),
 CHECK ((kind = 'OBSTACLE' AND width_cm > 0 AND height_cm > 0) OR (kind <> 'OBSTACLE' AND width_cm = 0 AND height_cm = 0))
);
CREATE INDEX idx_navigation_layout ON navigation_elements(layout_id);
CREATE UNIQUE INDEX idx_navigation_access ON navigation_elements(shelf_id) WHERE kind = 'ACCESS';