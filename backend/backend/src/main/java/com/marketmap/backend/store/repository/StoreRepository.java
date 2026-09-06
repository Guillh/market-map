package com.marketmap.backend.store.repository;

import com.marketmap.backend.store.Store;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreRepository extends JpaRepository<Store, UUID> {
}
