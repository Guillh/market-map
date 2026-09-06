package com.marketmap.backend.layout;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.marketmap.backend.store.Store;
import com.marketmap.backend.store.StoreNotFoundException;
import com.marketmap.backend.store.StoreRepository;

@Service
@Transactional(readOnly = true)
public class LayoutService {

    private final LayoutRepository layoutRepository;
    private final StoreRepository storeRepository;

    LayoutService(LayoutRepository layoutRepository, StoreRepository storeRepository) {
        this.layoutRepository = layoutRepository;
        this.storeRepository = storeRepository;
    }

    public List<LayoutResponse> findAll() {
        return layoutRepository.findAll().stream()
                .map(LayoutResponse::from)
                .toList();
    }

    public LayoutResponse findById(UUID id) {
        return LayoutResponse.from(getLayout(id));
    }

    @Transactional
    public LayoutResponse create(LayoutRequest request) {
        Store store = getStore(request.storeId());
        Layout layout = new Layout(store, request.name(), request.widthCm(), request.heightCm());
        return LayoutResponse.from(layoutRepository.save(layout));
    }

    @Transactional
    public LayoutResponse update(UUID id, LayoutRequest request) {
        Layout layout = getLayout(id);
        Store store = getStore(request.storeId());
        layout.update(store, request.name(), request.widthCm(), request.heightCm());
        return LayoutResponse.from(layout);
    }

    @Transactional
    public void delete(UUID id) {
        layoutRepository.delete(getLayout(id));
    }

    private Layout getLayout(UUID id) {
        return layoutRepository.findById(id)
                .orElseThrow(() -> new LayoutNotFoundException(id));
    }

    private Store getStore(UUID id) {
        return storeRepository.findById(id)
                .orElseThrow(() -> new StoreNotFoundException(id));
    }
}
