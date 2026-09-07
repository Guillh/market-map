package com.marketmap.backend.shelf.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.marketmap.backend.shelf.Shelf;

public interface ShelfRepository extends JpaRepository<Shelf, UUID> {

    List<Shelf> findByLayoutId(UUID layoutId);
}
