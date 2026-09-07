package com.marketmap.backend.shelf.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.marketmap.backend.shelf.ShelfSection;

public interface ShelfSectionRepository extends JpaRepository<ShelfSection, UUID> {

    List<ShelfSection> findByShelfId(UUID shelfId);
}
