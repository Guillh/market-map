package com.marketmap.backend.product.repository;

import com.marketmap.backend.product.Product;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, UUID> {
}
