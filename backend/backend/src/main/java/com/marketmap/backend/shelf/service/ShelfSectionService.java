package com.marketmap.backend.shelf.service;

import com.marketmap.backend.shelf.Shelf;

import com.marketmap.backend.shelf.repository.ShelfSectionRepository;

import com.marketmap.backend.shelf.repository.ShelfRepository;

import com.marketmap.backend.shelf.exception.ShelfSectionNotFoundException;

import com.marketmap.backend.shelf.exception.ShelfNotFoundException;

import com.marketmap.backend.shelf.dto.ShelfSectionResponse;

import com.marketmap.backend.shelf.dto.ShelfSectionRequest;

import com.marketmap.backend.shelf.ShelfSection;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ShelfSectionService {

    private final ShelfSectionRepository shelfSectionRepository;
    private final ShelfRepository shelfRepository;

    ShelfSectionService(ShelfSectionRepository shelfSectionRepository, ShelfRepository shelfRepository) {
        this.shelfSectionRepository = shelfSectionRepository;
        this.shelfRepository = shelfRepository;
    }

    public List<ShelfSectionResponse> findAll(UUID shelfId) {
        List<ShelfSection> sections = shelfId == null ? shelfSectionRepository.findAll() : shelfSectionRepository.findByShelfId(shelfId);
        return sections.stream().map(ShelfSectionResponse::from).toList();
    }

    public ShelfSectionResponse findById(UUID id) {
        return ShelfSectionResponse.from(getSection(id));
    }

    @Transactional
    public ShelfSectionResponse create(ShelfSectionRequest request) {
        Shelf shelf = getShelf(request.shelfId());
        ShelfSection section = new ShelfSection(shelf, request.name(), request.levelIndex(), request.positionIndex());
        return ShelfSectionResponse.from(shelfSectionRepository.save(section));
    }

    @Transactional
    public ShelfSectionResponse update(UUID id, ShelfSectionRequest request) {
        ShelfSection section = getSection(id);
        Shelf shelf = getShelf(request.shelfId());
        section.update(shelf, request.name(), request.levelIndex(), request.positionIndex());
        return ShelfSectionResponse.from(section);
    }

    @Transactional
    public void delete(UUID id) {
        shelfSectionRepository.delete(getSection(id));
    }

    private ShelfSection getSection(UUID id) {
        return shelfSectionRepository.findById(id).orElseThrow(() -> new ShelfSectionNotFoundException(id));
    }

    private Shelf getShelf(UUID id) {
        return shelfRepository.findById(id).orElseThrow(() -> new ShelfNotFoundException(id));
    }
}
