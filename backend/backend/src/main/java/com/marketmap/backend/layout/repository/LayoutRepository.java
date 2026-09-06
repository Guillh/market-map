package com.marketmap.backend.layout.repository;

import com.marketmap.backend.layout.Layout;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface LayoutRepository extends JpaRepository<Layout, UUID> {

    List<Layout> findByStoreId(UUID storeId);
}
