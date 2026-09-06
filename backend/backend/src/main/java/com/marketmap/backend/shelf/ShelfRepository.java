package com.marketmap.backend.shelf;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ShelfRepository extends JpaRepository<Shelf, UUID> {
}
