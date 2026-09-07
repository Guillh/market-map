package com.marketmap.backend.layout.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.marketmap.backend.layout.Layout;

public interface LayoutRepository extends JpaRepository<Layout, UUID> {

    List<Layout> findByStoreId(UUID storeId);
}
