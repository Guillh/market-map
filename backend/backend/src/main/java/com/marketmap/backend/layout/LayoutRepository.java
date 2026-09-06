package com.marketmap.backend.layout;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface LayoutRepository extends JpaRepository<Layout, UUID> {
}
