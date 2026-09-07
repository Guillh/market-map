package com.marketmap.backend.store.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.marketmap.backend.store.Store;
import com.marketmap.backend.store.dto.StoreRequest;
import com.marketmap.backend.store.dto.StoreResponse;
import com.marketmap.backend.store.exception.StoreNotFoundException;
import com.marketmap.backend.store.repository.StoreRepository;

@Service
@Transactional(readOnly = true)
public class StoreService {

    private final StoreRepository storeRepository;

    StoreService(StoreRepository storeRepository) {
        this.storeRepository = storeRepository;
    }

    public List<StoreResponse> findAll() {
        return storeRepository.findAll().stream()
                .map(StoreResponse::from)
                .toList();
    }

    public StoreResponse findById(UUID id) {
        return StoreResponse.from(getStore(id));
    }

    @Transactional
    public StoreResponse create(StoreRequest request) {
        Store store = new Store(request.name(), request.description());
        return StoreResponse.from(storeRepository.save(store));
    }

    @Transactional
    public StoreResponse update(UUID id, StoreRequest request) {
        Store store = getStore(id);
        store.update(request.name(), request.description());
        return StoreResponse.from(store);
    }

    @Transactional
    public void delete(UUID id) {
        Store store = getStore(id);
        storeRepository.delete(store);
    }

    private Store getStore(UUID id) {
        return storeRepository.findById(id)
                .orElseThrow(() -> new StoreNotFoundException(id));
    }
}
