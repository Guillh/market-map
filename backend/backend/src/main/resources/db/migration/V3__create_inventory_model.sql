CREATE TABLE inventory_items (
    id UUID PRIMARY KEY,
    product_location_id UUID NOT NULL REFERENCES product_locations(id),
    quantity INTEGER NOT NULL,
    minimum_quantity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_inventory_items_product_location UNIQUE (product_location_id),
    CONSTRAINT ck_inventory_items_quantity_non_negative CHECK (quantity >= 0),
    CONSTRAINT ck_inventory_items_minimum_quantity_non_negative CHECK (minimum_quantity >= 0)
);

CREATE TABLE inventory_lots (
    id UUID PRIMARY KEY,
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
    lot_code VARCHAR(120) NOT NULL,
    expiration_date DATE,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT ck_inventory_lots_quantity_non_negative CHECK (quantity >= 0)
);

CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY,
    product_location_id UUID NOT NULL REFERENCES product_locations(id),
    type VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT ck_inventory_movements_quantity_positive CHECK (quantity > 0),
    CONSTRAINT ck_inventory_movements_type CHECK (type IN ('IN', 'OUT', 'ADJUSTMENT'))
);

CREATE INDEX idx_inventory_items_product_location_id ON inventory_items(product_location_id);
CREATE INDEX idx_inventory_lots_inventory_item_id ON inventory_lots(inventory_item_id);
CREATE INDEX idx_inventory_lots_expiration_date ON inventory_lots(expiration_date);
CREATE INDEX idx_inventory_movements_product_location_id ON inventory_movements(product_location_id);
CREATE INDEX idx_inventory_movements_created_at ON inventory_movements(created_at);
