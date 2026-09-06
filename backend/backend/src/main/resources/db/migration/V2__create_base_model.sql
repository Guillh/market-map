CREATE TABLE stores (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE layouts (
    id UUID PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES stores(id),
    name VARCHAR(120) NOT NULL,
    width_cm INTEGER NOT NULL,
    height_cm INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE shelves (
    id UUID PRIMARY KEY,
    layout_id UUID NOT NULL REFERENCES layouts(id),
    name VARCHAR(120) NOT NULL,
    position_x_cm INTEGER NOT NULL,
    position_y_cm INTEGER NOT NULL,
    width_cm INTEGER NOT NULL,
    height_cm INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE shelf_sections (
    id UUID PRIMARY KEY,
    shelf_id UUID NOT NULL REFERENCES shelves(id),
    name VARCHAR(120) NOT NULL,
    level_index INTEGER NOT NULL,
    position_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_shelf_sections_shelf_level_position UNIQUE (shelf_id, level_index, position_index)
);

CREATE TABLE products (
    id UUID PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    sku VARCHAR(80),
    brand VARCHAR(120),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_products_sku UNIQUE (sku)
);

CREATE TABLE product_locations (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id),
    shelf_section_id UUID NOT NULL REFERENCES shelf_sections(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_product_locations_product_section UNIQUE (product_id, shelf_section_id)
);

CREATE INDEX idx_layouts_store_id ON layouts(store_id);
CREATE INDEX idx_shelves_layout_id ON shelves(layout_id);
CREATE INDEX idx_shelf_sections_shelf_id ON shelf_sections(shelf_id);
CREATE INDEX idx_product_locations_product_id ON product_locations(product_id);
CREATE INDEX idx_product_locations_shelf_section_id ON product_locations(shelf_section_id);
