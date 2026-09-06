package com.marketmap.backend.product.repository;

import com.marketmap.backend.product.ProductLocation;

import com.marketmap.backend.product.Product;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductLocationRepository extends JpaRepository<ProductLocation, UUID> {
}
