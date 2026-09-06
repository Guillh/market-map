package com.marketmap.backend.shelf;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.marketmap.backend.layout.Layout;
import com.marketmap.backend.layout.LayoutNotFoundException;
import com.marketmap.backend.layout.LayoutRepository;

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
        Shelf shelf = new Shelf(layout, request.name(), request.positionXCm(), request.positionYCm(), request.widthCm(), request.heightCm());
        return ShelfResponse.from(shelfRepository.save(shelf));
    }

    @Transactional
    public ShelfResponse update(UUID id, ShelfRequest request) {
        Shelf shelf = getShelf(id);
        Layout layout = getLayout(request.layoutId());
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

