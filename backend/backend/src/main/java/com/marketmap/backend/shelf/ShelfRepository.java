package com.marketmap.backend.shelf;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ShelfRepository extends JpaRepository<Shelf, UUID> {

    List<Shelf> findByLayoutId(UUID layoutId);
}
