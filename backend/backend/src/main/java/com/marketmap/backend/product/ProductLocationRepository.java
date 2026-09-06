package com.marketmap.backend.product;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductLocationRepository extends JpaRepository<ProductLocation, UUID> {
}
