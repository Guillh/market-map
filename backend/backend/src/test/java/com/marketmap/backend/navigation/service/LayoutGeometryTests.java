package com.marketmap.backend.navigation.service;

import java.util.List;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import com.marketmap.backend.layout.dto.LayoutVertex;
import com.marketmap.backend.layout.service.LayoutGeometry;
import com.marketmap.backend.navigation.service.PathFinder.Point;
import org.springframework.web.server.ResponseStatusException;

class LayoutGeometryTests {
    private final List<LayoutVertex> u = List.of(new LayoutVertex(0,0),new LayoutVertex(200,0),
        new LayoutVertex(200,400),new LayoutVertex(400,400),new LayoutVertex(400,0),
        new LayoutVertex(600,0),new LayoutVertex(600,600),new LayoutVertex(0,600));

    @Test void routeMustGoAroundUShapedRecess() {
        var route = new PathFinder().find(600,600,List.of(),new Point(100,100),new Point(500,100),u).orElseThrow();
        assertEquals(1040,route.distanceCm());
        for(int i=1;i<route.points().size();i++) {
            var a=route.points().get(i-1);var b=route.points().get(i);
            assertTrue(LayoutGeometry.clearSegment(u,new LayoutVertex(a.x(),a.y()),new LayoutVertex(b.x(),b.y()),20));
        }
    }

    @Test void rejectsOriginInBoundingBoxButOutsideStore() {
        assertTrue(new PathFinder().find(600,600,List.of(),new Point(300,100),new Point(500,100),u).isEmpty());
    }

    @Test void rejectsRectangleSpanningRecessEvenWithFourCornersInside() {
        assertFalse(LayoutGeometry.containsRectangle(u,100,100,400,400));
        assertTrue(LayoutGeometry.containsRectangle(u,0,0,200,300));
        assertTrue(LayoutGeometry.containsRectangle(u,220,420,100,100));
    }

    @Test void rejectsSelfIntersectionRepeatedPointsAndCollinearCorners() {
        assertThrows(ResponseStatusException.class, () -> LayoutGeometry.validate(600,600,
            List.of(new LayoutVertex(0,0),new LayoutVertex(600,600),new LayoutVertex(600,0),new LayoutVertex(0,600))));
        assertThrows(ResponseStatusException.class, () -> LayoutGeometry.validate(600,600,
            List.of(new LayoutVertex(0,0),new LayoutVertex(600,0),new LayoutVertex(0,0))));
        assertThrows(ResponseStatusException.class, () -> LayoutGeometry.validate(600,600,
            List.of(new LayoutVertex(0,0),new LayoutVertex(200,0),new LayoutVertex(600,0),new LayoutVertex(0,600))));
    }

    @Test void acceptsConcaveShapeInBothDirectionsAndRejectsOutOfBounds() {
        assertDoesNotThrow(() -> LayoutGeometry.validate(600,600,u));
        assertDoesNotThrow(() -> LayoutGeometry.validate(600,600,u.reversed()));
        assertThrows(ResponseStatusException.class, () -> LayoutGeometry.validate(500,600,u));
    }

    @Test void diagonalWallMaintainsClearance() {
        var polygon=List.of(new LayoutVertex(0,0),new LayoutVertex(600,0),new LayoutVertex(400,600),new LayoutVertex(0,600));
        var route = new PathFinder().find(600,600,List.of(),new Point(100,100),new Point(250,500),polygon).orElseThrow();
        assertEquals(550,route.distanceCm());
        assertFalse(LayoutGeometry.free(polygon,new LayoutVertex(430,500),20));
        for(int i=1;i<route.points().size();i++) {
            var a=route.points().get(i-1);var b=route.points().get(i);
            assertTrue(LayoutGeometry.clearSegment(polygon,new LayoutVertex(a.x(),a.y()),new LayoutVertex(b.x(),b.y()),20));
        }
    }
}