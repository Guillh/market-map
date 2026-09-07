package com.marketmap.backend.navigation.service;

import java.util.List;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import com.marketmap.backend.navigation.service.PathFinder.*;

class PathFinderTests {
    private final PathFinder finder = new PathFinder();

    @Test void directRouteHasCorrectDistanceAndEndpoints() {
        var route = finder.find(500,500,List.of(),new Point(40,40),new Point(440,40)).orElseThrow();
        assertEquals(400,route.distanceCm());
        assertEquals(List.of(new Point(40,40),new Point(440,40)),route.points());
    }

    @Test void detoursAroundShelfWithClearance() {
        var route = finder.find(500,500,List.of(new Block(200,100,100,200)),new Point(40,200),new Point(440,200)).orElseThrow();
        assertEquals(640,route.distanceCm());
        assertTrue(route.points().stream().anyMatch(p -> p.y() <= 80 || p.y() >= 320));
    }

    @Test void fullWallHasNoRoute() {
        assertTrue(finder.find(500,500,List.of(new Block(200,0,100,500)),new Point(40,200),new Point(440,200)).isEmpty());
    }

    @Test void rejectsBlockedAndOutOfBoundsEndpoints() {
        var blocks = List.of(new Block(200,100,100,200));
        assertTrue(finder.find(500,500,blocks,new Point(210,200),new Point(440,200)).isEmpty());
        assertTrue(finder.find(500,500,blocks,new Point(40,40),new Point(600,40)).isEmpty());
        assertTrue(finder.find(500,500,blocks,new Point(40,40),new Point(190,200)).isEmpty());
    }

    @Test void narrowPassageDoesNotAllowCornerCutting() {
        var blocks = List.of(new Block(200,0,100,230),new Block(200,260,100,240));
        assertTrue(finder.find(500,500,blocks,new Point(40,245),new Point(440,245)).isEmpty());
    }

    @Test void sameOriginAndDestinationHasZeroDistance() {
        var route = finder.find(500,500,List.of(),new Point(40,40),new Point(40,40)).orElseThrow();
        assertEquals(0,route.distanceCm());
        assertEquals(1,route.points().size());
    }

    @Test void choosesShortestReachableGoalInsteadOfNearestAcrossWall() {
        var route=finder.findAny(600,600,List.of(new Block(200,0,100,500)),
            new Point(40,100),List.of(new Point(340,100),new Point(40,500)),List.of()).orElseThrow();
        assertEquals(new Point(40,500),route.points().getLast());
        assertEquals(400,route.distanceCm());
    }}