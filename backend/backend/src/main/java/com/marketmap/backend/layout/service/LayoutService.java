package com.marketmap.backend.layout.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.marketmap.backend.layout.Layout;
import com.marketmap.backend.layout.dto.LayoutRequest;
import com.marketmap.backend.layout.dto.LayoutResponse;
import com.marketmap.backend.layout.exception.LayoutNotFoundException;
import com.marketmap.backend.layout.repository.LayoutRepository;
import com.marketmap.backend.store.Store;
import com.marketmap.backend.store.exception.StoreNotFoundException;
import com.marketmap.backend.store.repository.StoreRepository;

@Service
@Transactional(readOnly = true)
public class LayoutService {

    private final LayoutRepository layoutRepository;
    private final StoreRepository storeRepository;

    private final com.marketmap.backend.shelf.repository.ShelfRepository shelves;
    private final com.marketmap.backend.navigation.repository.NavigationRepository navigation;

    LayoutService(LayoutRepository layoutRepository, StoreRepository storeRepository,
        com.marketmap.backend.shelf.repository.ShelfRepository shelves,
        com.marketmap.backend.navigation.repository.NavigationRepository navigation) {
        this.shelves = shelves;
        this.navigation = navigation;
        this.layoutRepository = layoutRepository;
        this.storeRepository = storeRepository;
    }

    public List<LayoutResponse> findAll(UUID storeId) {
        List<Layout> layouts = storeId == null ? layoutRepository.findAll() : layoutRepository.findByStoreId(storeId);
        return layouts.stream()
                .map(LayoutResponse::from)
                .toList();
    }

    public LayoutResponse findById(UUID id) {
        return LayoutResponse.from(getLayout(id));
    }

    @Transactional
    public LayoutResponse create(LayoutRequest request) {
        Store store = getStore(request.storeId());
        LayoutGeometry.validate(request.widthCm(), request.heightCm(), request.boundary());
        Layout layout = new Layout(store, request.name(), request.widthCm(), request.heightCm());
        if (request.boundary() != null) layout.setBoundary(request.boundary());
        return LayoutResponse.from(layoutRepository.save(layout));
    }

    @Transactional
    public LayoutResponse update(UUID id, LayoutRequest request) {
        Layout layout = getLayout(id);
        Store store = getStore(request.storeId());
        var vertices = request.boundary() == null
            ? layout.getBoundary().stream().map(v -> new com.marketmap.backend.layout.dto.LayoutVertex(v.getX(),v.getY())).toList()
            : request.boundary();
        LayoutGeometry.validate(request.widthCm(),request.heightCm(),vertices);
        var polygon = LayoutGeometry.effective(request.widthCm(),request.heightCm(),vertices);
        for (var shelf : shelves.findByLayoutId(id)) {
            if (!LayoutGeometry.containsRectangle(polygon,shelf.getPositionXCm(),shelf.getPositionYCm(),shelf.getWidthCm(),shelf.getHeightCm()))
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "O novo contorno deixa a prateleira " + shelf.getName() + " fora da loja. Reposicione-a antes de salvar.");
        }
        for (var element : navigation.findAll()) {
            if (!element.layoutId().equals(id)) continue;
            boolean valid = element.kind() == com.marketmap.backend.navigation.dto.NavigationElement.Kind.OBSTACLE
                ? LayoutGeometry.containsRectangle(polygon,element.xCm(),element.yCm(),element.widthCm(),element.heightCm())
                : LayoutGeometry.free(polygon,new com.marketmap.backend.layout.dto.LayoutVertex(element.xCm(),element.yCm()),20);
            if (!valid) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                "O novo contorno deixa " + element.name() + " fora da área permitida. Reposicione-o antes de salvar.");
        }
        layout.update(store, request.name(), request.widthCm(), request.heightCm());
        layout.setBoundary(vertices);
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
