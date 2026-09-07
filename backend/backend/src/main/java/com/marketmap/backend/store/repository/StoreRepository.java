package com.marketmap.backend.store.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.marketmap.backend.store.Store;

public interface StoreRepository extends JpaRepository<Store, UUID> {
}
