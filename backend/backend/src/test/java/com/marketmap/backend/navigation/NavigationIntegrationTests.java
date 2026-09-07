package com.marketmap.backend.navigation;

import java.util.UUID;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;
import com.marketmap.backend.store.Store;
import com.marketmap.backend.layout.Layout;
import com.marketmap.backend.shelf.Shelf;
import com.marketmap.backend.shelf.ShelfSection;
import com.marketmap.backend.product.Product;
import com.marketmap.backend.product.ProductLocation;
import com.marketmap.backend.navigation.dto.NavigationElement;
import com.marketmap.backend.navigation.dto.NavigationElement.Kind;
import com.marketmap.backend.navigation.service.NavigationService;
import com.marketmap.backend.navigation.service.PathFinder.Point;
import com.marketmap.backend.search.service.SearchService;

@SpringBootTest
@Transactional
class NavigationIntegrationTests {
    @Autowired EntityManager em;
    @Autowired NavigationService navigation;
    @Autowired SearchService search;
    @Autowired com.marketmap.backend.layout.service.LayoutService layoutService;
    @Autowired com.marketmap.backend.shelf.service.ShelfService shelfService;
    Layout layout;
    Shelf shelf;

    @BeforeEach void setup() {
        Store store = new Store("Teste de navegação", null);
        em.persist(store);
        layout = new Layout(store,"Teste",800,600);
        em.persist(layout);
        shelf = new Shelf(layout,"Prateleira teste",300,150,100,200);
        em.persist(shelf);
        em.flush();
    }

    NavigationElement save(Kind kind, String name, int x, int y, UUID shelfId) {
        return navigation.save(null,new NavigationElement(null,layout.getId(),kind,name,x,y,0,0,shelfId));
    }

    @Test void twoTerminalsProduceDifferentOriginsAndDistances() {
        var a = save(Kind.TERMINAL,"Entrada",40,40,null);
        var b = save(Kind.TERMINAL,"Fundo",700,500,null);
        save(Kind.ACCESS,"Acesso",450,250,shelf.getId());
        var routeA = navigation.route(a.id(),shelf.getId());
        var routeB = navigation.route(b.id(),shelf.getId());
        assertEquals(new Point(40,40),routeA.points().getFirst());
        assertEquals(new Point(700,500),routeB.points().getFirst());
        assertEquals(new Point(450,250),routeA.points().getLast());
        assertNotEquals(routeA.distanceCm(),routeB.distanceCm());
        assertTrue(navigation.list().stream().anyMatch(e -> e.id().equals(a.id())));
    }

    @Test void cannotPlaceTerminalInsideShelfOrBlockExistingTerminal() {
        assertThrows(ResponseStatusException.class, () -> save(Kind.TERMINAL,"Dentro",320,200,null));
        save(Kind.TERMINAL,"Entrada",50,50,null);
        assertThrows(ResponseStatusException.class, () -> navigation.save(null,
            new NavigationElement(null,layout.getId(),Kind.OBSTACLE,"Parede",30,30,50,50,null)));
    }

    @Test void supportsAutomaticAccessAndRejectsCrossLayoutDestination() {
        var terminal = save(Kind.TERMINAL,"Entrada",40,40,null);
        assertTrue(navigation.route(terminal.id(),shelf.getId()).automaticAccess());
        Layout other = new Layout(layout.getStore(),"Outro",800,600);
        em.persist(other);
        Shelf otherShelf = new Shelf(other,"Outra",300,150,100,200);
        em.persist(otherShelf);
        em.flush();
        assertThrows(ResponseStatusException.class, () -> navigation.route(terminal.id(),otherShelf.getId()));
    }

    @Test void movedShelfInvalidatesObstructedOrigin() {
        var terminal = save(Kind.TERMINAL,"Entrada",40,40,null);
        save(Kind.ACCESS,"Acesso",450,250,shelf.getId());
        shelf.update(layout,"Movida",20,20,400,300);
        em.flush();
        assertThrows(ResponseStatusException.class, () -> navigation.route(terminal.id(),shelf.getId()));
    }

    @Test void duplicateAccessIsRejectedAndTerminalCanBeUpdatedAndDeleted() {
        save(Kind.ACCESS,"Acesso",450,250,shelf.getId());
        assertThrows(ResponseStatusException.class, () -> save(Kind.ACCESS,"Duplicado",450,280,shelf.getId()));
        var terminal = save(Kind.TERMINAL,"Entrada",40,40,null);
        navigation.save(terminal.id(),new NavigationElement(null,layout.getId(),Kind.TERMINAL,"Entrada atualizada",60,60,0,0,null));
        assertEquals(new Point(60,60),navigation.route(terminal.id(),shelf.getId()).points().getFirst());
        navigation.delete(terminal.id());
        assertThrows(ResponseStatusException.class, () -> navigation.route(terminal.id(),shelf.getId()));
    }

    @Test void suggestionsGroupLocationsAndIncludeUnlocatedProducts() {
        String query = "Teste-" + UUID.randomUUID();
        Product product = new Product(query + " localizado",null,null);
        Product unlocated = new Product(query + " sem local",null,null);
        em.persist(product);
        em.persist(unlocated);
        ShelfSection low = new ShelfSection(shelf,"Baixo",0,0);
        ShelfSection high = new ShelfSection(shelf,"Alto",2,0);
        em.persist(low);
        em.persist(high);
        em.persist(new ProductLocation(product,low));
        em.persist(new ProductLocation(product,high));
        em.flush();
        var results = search.suggestions(query,layout.getId());
        assertEquals(2,results.size());
        assertEquals(2,results.stream().filter(p -> p.productId().equals(product.getId())).findFirst().orElseThrow().locations().size());
        assertTrue(results.stream().filter(p -> p.productId().equals(unlocated.getId())).findFirst().orElseThrow().locations().isEmpty());
        Layout other = new Layout(layout.getStore(),"Outro",800,600);
        em.persist(other);
        em.flush();
        var otherResults = search.suggestions(query,other.getId());
        assertEquals(1,otherResults.size());
        assertEquals(unlocated.getId(),otherResults.getFirst().productId());
    }

    @Test void savesBoundaryAndPreservesItWhenOldClientOmitsBoundary() {
        var points = java.util.List.of(new com.marketmap.backend.layout.dto.LayoutVertex(0,0),
            new com.marketmap.backend.layout.dto.LayoutVertex(500,0),new com.marketmap.backend.layout.dto.LayoutVertex(500,400),
            new com.marketmap.backend.layout.dto.LayoutVertex(800,400),new com.marketmap.backend.layout.dto.LayoutVertex(800,600),
            new com.marketmap.backend.layout.dto.LayoutVertex(0,600));
        var saved=layoutService.update(layout.getId(),new com.marketmap.backend.layout.dto.LayoutRequest(layout.getStore().getId(),"Formato L",800,600,points));
        assertEquals(points,saved.boundary());
        em.flush();
        em.clear();
        assertEquals(points,layoutService.findById(layout.getId()).boundary());
        layoutService.update(layout.getId(),new com.marketmap.backend.layout.dto.LayoutRequest(saved.storeId(),"Renomeado",800,600,null));
        assertEquals(points,layoutService.findById(layout.getId()).boundary());
        assertThrows(ResponseStatusException.class, () -> save(Kind.TERMINAL,"Fora do L",700,100,null));
        assertThrows(ResponseStatusException.class, () -> navigation.save(null,
            new NavigationElement(null,layout.getId(),Kind.OBSTACLE,"Fora",600,50,50,50,null)));
    }

    @Test void changingShapeCannotCutExistingShelvesOrTerminals() {
        var points = java.util.List.of(new com.marketmap.backend.layout.dto.LayoutVertex(0,0),
            new com.marketmap.backend.layout.dto.LayoutVertex(200,0),new com.marketmap.backend.layout.dto.LayoutVertex(200,400),
            new com.marketmap.backend.layout.dto.LayoutVertex(800,400),new com.marketmap.backend.layout.dto.LayoutVertex(800,600),
            new com.marketmap.backend.layout.dto.LayoutVertex(0,600));
        assertThrows(ResponseStatusException.class, () -> layoutService.update(layout.getId(),
            new com.marketmap.backend.layout.dto.LayoutRequest(layout.getStore().getId(),"Inválido",800,600,points)));
        assertTrue(layoutService.findById(layout.getId()).boundary().isEmpty());
    }
    @Test void automaticRouteRespectsSavedUShapeWithoutManualAccess() {
        shelf.update(layout,"Destino",600,100,80,80);
        em.flush();
        var polygon=java.util.List.of(new com.marketmap.backend.layout.dto.LayoutVertex(0,0),
            new com.marketmap.backend.layout.dto.LayoutVertex(200,0),new com.marketmap.backend.layout.dto.LayoutVertex(200,400),
            new com.marketmap.backend.layout.dto.LayoutVertex(500,400),new com.marketmap.backend.layout.dto.LayoutVertex(500,0),
            new com.marketmap.backend.layout.dto.LayoutVertex(800,0),new com.marketmap.backend.layout.dto.LayoutVertex(800,600),
            new com.marketmap.backend.layout.dto.LayoutVertex(0,600));
        layoutService.update(layout.getId(),new com.marketmap.backend.layout.dto.LayoutRequest(layout.getStore().getId(),"U",800,600,polygon));
        var terminal=save(Kind.TERMINAL,"Origem",100,100,null);
        var route=navigation.route(terminal.id(),shelf.getId());
        assertTrue(route.automaticAccess());
        assertTrue(route.points().stream().anyMatch(p -> p.y()>=420));
        for(int i=1;i<route.points().size();i++) {
            var a=route.points().get(i-1); var b=route.points().get(i);
            assertTrue(com.marketmap.backend.layout.service.LayoutGeometry.clearSegment(polygon,
                new com.marketmap.backend.layout.dto.LayoutVertex(a.x(),a.y()),
                new com.marketmap.backend.layout.dto.LayoutVertex(b.x(),b.y()),20));
        }
        assertThrows(ResponseStatusException.class, () -> navigation.save(terminal.id(),
            new NavigationElement(null,layout.getId(),Kind.TERMINAL,"Origem",350,100,0,0,null)));
        assertEquals(100,navigation.list().stream().filter(e -> e.id().equals(terminal.id())).findFirst().orElseThrow().xCm());
    }

    @Test void configuredAccessIsStillPreferredOverAutomaticDestination() {
        var terminal=save(Kind.TERMINAL,"Origem",100,100,null);
        save(Kind.ACCESS,"Face escolhida",440,250,shelf.getId());
        var route=navigation.route(terminal.id(),shelf.getId());
        assertFalse(route.automaticAccess());
        assertEquals(new Point(440,250),route.points().getLast());
    }}