package com.marketmap.backend.shelf.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.marketmap.backend.layout.Layout;
import com.marketmap.backend.layout.exception.LayoutNotFoundException;
import com.marketmap.backend.layout.repository.LayoutRepository;
import com.marketmap.backend.shelf.Shelf;
import com.marketmap.backend.shelf.dto.ShelfRequest;
import com.marketmap.backend.shelf.dto.ShelfResponse;
import com.marketmap.backend.shelf.exception.ShelfNotFoundException;
import com.marketmap.backend.shelf.repository.ShelfRepository;

@Service
@Transactional(readOnly = true)
public class ShelfService {

    private final ShelfRepository shelfRepository;
    private final LayoutRepository layoutRepository;

    ShelfService(ShelfRepository shelfRepository, LayoutRepository layoutRepository) {
        this.shelfRepository = shelfRepository;
        this.layoutRepository = layoutRepository;
    }

    public List<ShelfResponse> findAll(UUID layoutId) {
        List<Shelf> shelves = layoutId == null ? shelfRepository.findAll() : shelfRepository.findByLayoutId(layoutId);
        return shelves.stream().map(ShelfResponse::from).toList();
    }

    public ShelfResponse findById(UUID id) {
        return ShelfResponse.from(getShelf(id));
    }

    @Transactional
    public ShelfResponse create(ShelfRequest request) {
        Layout layout = getLayout(request.layoutId());
        if (!com.marketmap.backend.layout.service.LayoutGeometry.containsRectangle(
            com.marketmap.backend.layout.service.LayoutGeometry.boundary(layout),request.positionXCm(),request.positionYCm(),request.widthCm(),request.heightCm()))
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                "A prateleira deve ficar inteiramente dentro do contorno da loja.");
        Shelf shelf = new Shelf(layout, request.name(), request.positionXCm(), request.positionYCm(), request.widthCm(), request.heightCm());
        return ShelfResponse.from(shelfRepository.save(shelf));
    }

    @Transactional
    public ShelfResponse update(UUID id, ShelfRequest request) {
        Shelf shelf = getShelf(id);
        Layout layout = getLayout(request.layoutId());
        if (!com.marketmap.backend.layout.service.LayoutGeometry.containsRectangle(
            com.marketmap.backend.layout.service.LayoutGeometry.boundary(layout),request.positionXCm(),request.positionYCm(),request.widthCm(),request.heightCm()))
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                "A prateleira deve ficar inteiramente dentro do contorno da loja.");
        shelf.update(layout, request.name(), request.positionXCm(), request.positionYCm(), request.widthCm(), request.heightCm());
        return ShelfResponse.from(shelf);
    }

    @Transactional
    public void delete(UUID id) {
        shelfRepository.delete(getShelf(id));
    }

    private Shelf getShelf(UUID id) {
        return shelfRepository.findById(id).orElseThrow(() -> new ShelfNotFoundException(id));
    }

    private Layout getLayout(UUID id) {
        return layoutRepository.findById(id).orElseThrow(() -> new LayoutNotFoundException(id));
    }
}
