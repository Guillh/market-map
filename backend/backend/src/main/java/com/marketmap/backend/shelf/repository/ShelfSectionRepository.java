package com.marketmap.backend.shelf.repository;

import com.marketmap.backend.shelf.ShelfSection;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ShelfSectionRepository extends JpaRepository<ShelfSection, UUID> {

    List<ShelfSection> findByShelfId(UUID shelfId);
}
