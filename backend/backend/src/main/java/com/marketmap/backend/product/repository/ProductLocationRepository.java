package com.marketmap.backend.product.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.marketmap.backend.product.ProductLocation;

public interface ProductLocationRepository extends JpaRepository<ProductLocation, UUID> {
}
