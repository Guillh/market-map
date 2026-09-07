package com.marketmap.backend.navigation.service;

import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.marketmap.backend.layout.Layout;
import com.marketmap.backend.layout.repository.LayoutRepository;
import com.marketmap.backend.shelf.Shelf;
import com.marketmap.backend.shelf.repository.ShelfRepository;
import com.marketmap.backend.navigation.dto.NavigationElement;
import com.marketmap.backend.navigation.dto.NavigationElement.Kind;
import com.marketmap.backend.navigation.repository.NavigationRepository;
import com.marketmap.backend.navigation.service.PathFinder.*;

@Service
@Transactional
public class NavigationService {
    private final NavigationRepository elements;
    private final LayoutRepository layouts;
    private final ShelfRepository shelves;
    private final PathFinder pathFinder;

    public NavigationService(NavigationRepository elements, LayoutRepository layouts, ShelfRepository shelves, PathFinder pathFinder) {
        this.elements = elements; this.layouts = layouts; this.shelves = shelves; this.pathFinder = pathFinder;
    }

    @Transactional(readOnly = true)
    public List<NavigationElement> list() { return elements.findAll(); }

    public NavigationElement save(UUID id, NavigationElement e) {
        Layout layout = layout(e.layoutId());
        List<NavigationElement> all = elements.findAll();
        if (id != null) {
            NavigationElement old = all.stream().filter(n -> n.id().equals(id)).findFirst()
                .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Elemento não encontrado."));
            if (!old.layoutId().equals(e.layoutId()) || old.kind() != e.kind())
                throw error(HttpStatus.BAD_REQUEST, "O tipo e o layout de um elemento existente não podem mudar.");
        }
        List<NavigationElement> others = all.stream().filter(n -> n.layoutId().equals(e.layoutId()) && !n.id().equals(id)).toList();
        if (e.kind() == Kind.OBSTACLE) {
            if (e.shelfId() != null || e.widthCm() <= 0 || e.heightCm() <= 0
                || (long)e.xCm()+e.widthCm() > layout.getWidthCm() || (long)e.yCm()+e.heightCm() > layout.getHeightCm())
                throw error(HttpStatus.BAD_REQUEST, "O obstáculo precisa ter dimensões positivas e ficar dentro do mapa.");
            if (!com.marketmap.backend.layout.service.LayoutGeometry.containsRectangle(
                com.marketmap.backend.layout.service.LayoutGeometry.boundary(layout),e.xCm(),e.yCm(),e.widthCm(),e.heightCm()))
                throw error(HttpStatus.BAD_REQUEST,"O obstáculo deve ficar inteiramente dentro do contorno da loja.");
            List<Block> blocks = blocks(e.layoutId(), others);
            blocks.add(new Block(e.xCm(), e.yCm(), e.widthCm(), e.heightCm()));
            if (others.stream().filter(n -> n.kind() != Kind.OBSTACLE)
                .anyMatch(n -> !pathFinder.free(point(n), layout.getWidthCm(), layout.getHeightCm(), blocks, com.marketmap.backend.layout.service.LayoutGeometry.boundary(layout))))
                throw error(HttpStatus.BAD_REQUEST, "O obstáculo bloqueia um terminal ou ponto de acesso. Reposicione o ponto primeiro.");
        } else {
            if (e.widthCm() != 0 || e.heightCm() != 0 || !pathFinder.free(point(e), layout.getWidthCm(), layout.getHeightCm(), blocks(e.layoutId(), others), com.marketmap.backend.layout.service.LayoutGeometry.boundary(layout)))
                throw error(HttpStatus.BAD_REQUEST, "Posicione o ponto em área livre, a pelo menos 20 cm das bordas e dos obstáculos.");
            if (e.kind() == Kind.ACCESS) {
                Shelf shelf = shelf(e.shelfId());
                validateAccess(e, shelf);
                if (others.stream().anyMatch(n -> e.shelfId().equals(n.shelfId())))
                    throw error(HttpStatus.CONFLICT, "Esta prateleira já tem um ponto de acesso. Edite o ponto existente.");
            } else if (e.shelfId() != null) throw error(HttpStatus.BAD_REQUEST, "Um terminal não deve ter prateleira associada.");
        }
        return elements.save(id == null ? UUID.randomUUID() : id, e);
    }

    public void delete(UUID id) {
        if (elements.delete(id) == 0) throw error(HttpStatus.NOT_FOUND, "Elemento não encontrado.");
    }

    @Transactional(readOnly = true)
    public Route route(UUID terminalId, UUID shelfId) {
        List<NavigationElement> all = elements.findAll();
        NavigationElement terminal = all.stream().filter(n -> n.id().equals(terminalId) && n.kind() == Kind.TERMINAL).findFirst()
            .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Terminal não encontrado. Configure este navegador novamente."));
        Shelf shelf = shelf(shelfId);
        if (!shelf.getLayout().getId().equals(terminal.layoutId()))
            throw error(HttpStatus.BAD_REQUEST, "O produto e o terminal precisam estar no mesmo layout.");
        NavigationElement access = all.stream().filter(n -> n.kind() == Kind.ACCESS && shelfId.equals(n.shelfId())).findFirst()
            .orElse(null);
        if (access != null) validateAccess(access, shelf);
        Layout layout = layout(terminal.layoutId());
        try {
            var blocked = blocks(layout.getId(),all);
            var boundary = com.marketmap.backend.layout.service.LayoutGeometry.boundary(layout);
            if (!pathFinder.free(point(terminal),layout.getWidthCm(),layout.getHeightCm(),blocked,boundary))
                throw error(HttpStatus.UNPROCESSABLE_CONTENT,"O terminal salvo está fora da área livre da loja. Reposicione e salve o computador.");
            var destinations = access == null ? automaticAccessPoints(shelf,point(terminal),blocked) : List.of(point(access));
            boolean automatic = access == null;
            return pathFinder.findAny(layout.getWidthCm(), layout.getHeightCm(), blocked, point(terminal), destinations, boundary)
                .map(route -> new Route(route.points(),route.distanceCm(),automatic))
                .orElseThrow(() -> error(HttpStatus.UNPROCESSABLE_CONTENT, "Não há caminho livre. Confira o terminal, os corredores e o ponto de acesso."));
        } catch (IllegalArgumentException ex) {
            throw error(HttpStatus.UNPROCESSABLE_CONTENT, ex.getMessage());
        }
    }

    private List<Point> automaticAccessPoints(Shelf shelf, Point origin, List<Block> blocks) {
        int x=shelf.getPositionXCm(), y=shelf.getPositionYCm(), w=shelf.getWidthCm(), h=shelf.getHeightCm();
        int margin=PathFinder.CLEARANCE_CM;
        Set<Integer> xs=new TreeSet<>(), ys=new TreeSet<>();
        for(int i=0;i<=8;i++) { xs.add(x+(int)((long)w*i/8)); ys.add(y+(int)((long)h*i/8)); }
        xs.add(Math.clamp(origin.x(),x,x+w)); ys.add(Math.clamp(origin.y(),y,y+h));
        for(Block block:blocks) {
            xs.add(Math.clamp(block.x()-margin,x,x+w)); xs.add(Math.clamp(block.x()+block.width()+margin,x,x+w));
            ys.add(Math.clamp(block.y()-margin,y,y+h)); ys.add(Math.clamp(block.y()+block.height()+margin,y,y+h));
        }
        List<Point> result=new ArrayList<>();
        for(int px:xs) { result.add(new Point(px,y-margin)); result.add(new Point(px,y+h+margin)); }
        for(int py:ys) { result.add(new Point(x-margin,py)); result.add(new Point(x+w+margin,py)); }
        return result;
    }
    private void validateAccess(NavigationElement e, Shelf s) {
        if (!s.getLayout().getId().equals(e.layoutId()))
            throw error(HttpStatus.BAD_REQUEST, "A prateleira pertence a outro layout.");
        double dx = Math.max(Math.max((double)s.getPositionXCm()-e.xCm(), e.xCm()-((double)s.getPositionXCm()+s.getWidthCm())),0);
        double dy = Math.max(Math.max((double)s.getPositionYCm()-e.yCm(), e.yCm()-((double)s.getPositionYCm()+s.getHeightCm())),0);
        if (dx + dy > 100) throw error(HttpStatus.BAD_REQUEST, "O acesso deve ficar a até 100 cm da prateleira. Confira a posição salva.");
    }

    private List<Block> blocks(UUID layoutId, List<NavigationElement> all) {
        List<Block> result = new ArrayList<>();
        for (Shelf s : shelves.findByLayoutId(layoutId)) result.add(new Block(s.getPositionXCm(),s.getPositionYCm(),s.getWidthCm(),s.getHeightCm()));
        all.stream().filter(n -> n.layoutId().equals(layoutId) && n.kind() == Kind.OBSTACLE)
            .forEach(n -> result.add(new Block(n.xCm(),n.yCm(),n.widthCm(),n.heightCm())));
        return result;
    }

    private Layout layout(UUID id) { return layouts.findById(id).orElseThrow(() -> error(HttpStatus.NOT_FOUND,"Layout não encontrado.")); }
    private Shelf shelf(UUID id) {
        if (id == null) throw error(HttpStatus.BAD_REQUEST,"Selecione a prateleira.");
        return shelves.findById(id).orElseThrow(() -> error(HttpStatus.NOT_FOUND,"Prateleira não encontrada."));
    }
    private Point point(NavigationElement e) { return new Point(e.xCm(), e.yCm()); }
    private ResponseStatusException error(HttpStatus status, String message) { return new ResponseStatusException(status,message); }
}