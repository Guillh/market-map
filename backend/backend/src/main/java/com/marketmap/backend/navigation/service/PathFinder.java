package com.marketmap.backend.navigation.service;

import java.util.*;
import org.springframework.stereotype.Component;

/** A* on a coordinate-compressed orthogonal grid. Every edge is collision checked. */
@Component
public class PathFinder {
    public static final int CLEARANCE_CM = 20;
    public record Point(int x, int y) {}
    public record Block(int x, int y, int width, int height) {}
    public record Route(List<Point> points, double distanceCm, boolean automaticAccess) {
        public Route(List<Point> points, double distanceCm) { this(points,distanceCm,false); }
    }
    private record Candidate(int index, double cost, double estimate) {}

    public boolean free(Point p, int width, int height, List<Block> blocks) {
        return p.x() >= CLEARANCE_CM && p.y() >= CLEARANCE_CM
            && p.x() <= width - CLEARANCE_CM && p.y() <= height - CLEARANCE_CM
            && blocks.stream().noneMatch(b -> inside(p, b));
    }

    public boolean free(Point p, int width, int height, List<Block> blocks,
        List<com.marketmap.backend.layout.dto.LayoutVertex> boundary) {
        return free(p,width,height,blocks) && com.marketmap.backend.layout.service.LayoutGeometry.free(
            com.marketmap.backend.layout.service.LayoutGeometry.effective(width,height,boundary),
            new com.marketmap.backend.layout.dto.LayoutVertex(p.x(),p.y()),CLEARANCE_CM);
    }

    private boolean inside(Point p, Block b) {
        return p.x() > (double)b.x() - CLEARANCE_CM && p.x() < (double)b.x() + b.width() + CLEARANCE_CM
            && p.y() > (double)b.y() - CLEARANCE_CM && p.y() < (double)b.y() + b.height() + CLEARANCE_CM;
    }

    private boolean clear(Point a, Point b, List<Block> blocks) {
        for (Block r : blocks) {
            double left = (double)r.x() - CLEARANCE_CM, right = (double)r.x() + r.width() + CLEARANCE_CM;
            double top = (double)r.y() - CLEARANCE_CM, bottom = (double)r.y() + r.height() + CLEARANCE_CM;
            if (a.x() == b.x() && a.x() > left && a.x() < right
                && Math.max(a.y(), b.y()) > top && Math.min(a.y(), b.y()) < bottom) return false;
            if (a.y() == b.y() && a.y() > top && a.y() < bottom
                && Math.max(a.x(), b.x()) > left && Math.min(a.x(), b.x()) < right) return false;
        }
        return true;
    }

    public Optional<Route> find(int width, int height, List<Block> blocks, Point start, Point end) {
        return find(width,height,blocks,start,end,List.of());
    }

    public Optional<Route> find(int width, int height, List<Block> blocks, Point start, Point end,
        List<com.marketmap.backend.layout.dto.LayoutVertex> boundary) {
        return findAny(width,height,blocks,start,List.of(end),boundary);
    }

    public Optional<Route> findAny(int width, int height, List<Block> blocks, Point start, List<Point> destinations,
        List<com.marketmap.backend.layout.dto.LayoutVertex> boundary) {
        var polygon = com.marketmap.backend.layout.service.LayoutGeometry.effective(width,height,boundary);
        if (!free(start,width,height,blocks,polygon)) return Optional.empty();
        var goals = destinations.stream().distinct().filter(p -> free(p,width,height,blocks,polygon)).toList();
        if (goals.isEmpty()) return Optional.empty();
        TreeSet<Integer> xs = new TreeSet<>(List.of(CLEARANCE_CM, width - CLEARANCE_CM, start.x()));
        TreeSet<Integer> ys = new TreeSet<>(List.of(CLEARANCE_CM, height - CLEARANCE_CM, start.y()));
        for (Point goal : goals) { xs.add(goal.x()); ys.add(goal.y()); }
        for (Block b : blocks) {
            for (long x : new long[]{(long)b.x()-CLEARANCE_CM, (long)b.x()+b.width()+CLEARANCE_CM})
                if (x >= CLEARANCE_CM && x <= width-CLEARANCE_CM) xs.add((int)x);
            for (long y : new long[]{(long)b.y()-CLEARANCE_CM, (long)b.y()+b.height()+CLEARANCE_CM})
                if (y >= CLEARANCE_CM && y <= height-CLEARANCE_CM) ys.add((int)y);
        }
        boolean diagonal = false;
        for (int i=0;i<polygon.size();i++) {
            var a=polygon.get(i); var b=polygon.get((i+1)%polygon.size());
            diagonal |= a.x()!=b.x() && a.y()!=b.y();
            for(long x : new long[]{(long)a.x()-CLEARANCE_CM,a.x(),(long)a.x()+CLEARANCE_CM})
                if(x>=CLEARANCE_CM && x<=width-CLEARANCE_CM) xs.add((int)x);
            for(long y : new long[]{(long)a.y()-CLEARANCE_CM,a.y(),(long)a.y()+CLEARANCE_CM})
                if(y>=CLEARANCE_CM && y<=height-CLEARANCE_CM) ys.add((int)y);
        }
        if(diagonal) {
            int step = Math.max(20,(int)Math.ceil(Math.max(width,height)/150.0));
            for(long x=CLEARANCE_CM;x<=width-CLEARANCE_CM;x+=step) xs.add((int)x);
            for(long y=CLEARANCE_CM;y<=height-CLEARANCE_CM;y+=step) ys.add((int)y);
        }
        int[] xx = xs.stream().mapToInt(Integer::intValue).toArray(), yy = ys.stream().mapToInt(Integer::intValue).toArray();
        if ((long)xx.length * yy.length > 250_000) throw new IllegalArgumentException("Mapa complexo demais para calcular a rota.");
        int size = xx.length * yy.length;
        double[] costs = new double[size];
        Arrays.fill(costs, Double.POSITIVE_INFINITY);
        int[] previous = new int[size];
        Arrays.fill(previous, -1);
        int first = Arrays.binarySearch(yy, start.y()) * xx.length + Arrays.binarySearch(xx, start.x());
        Set<Integer> goalIds = new HashSet<>();
        for (Point goal : goals) goalIds.add(Arrays.binarySearch(yy,goal.y()) * xx.length + Arrays.binarySearch(xx,goal.x()));
        PriorityQueue<Candidate> queue = new PriorityQueue<>(Comparator.comparingDouble(Candidate::estimate));
        costs[first] = 0;
        queue.add(new Candidate(first, 0, distanceToGoals(start, goals)));
        while (!queue.isEmpty()) {
            Candidate current = queue.remove();
            int id = current.index();
            if (current.cost() != costs[id]) continue;
            if (goalIds.contains(id)) {
                List<Point> path = new ArrayList<>();
                for (int at = id; at != -1; at = previous[at]) path.add(new Point(xx[at % xx.length], yy[at / xx.length]));
                Collections.reverse(path);
                List<Point> simplified = new ArrayList<>();
                for (Point p : path) {
                    while (simplified.size() >= 2) {
                        Point a = simplified.get(simplified.size()-2), b = simplified.getLast();
                        if ((a.x() == b.x() && b.x() == p.x()) || (a.y() == b.y() && b.y() == p.y()))
                            simplified.removeLast();
                        else break;
                    }
                    simplified.add(p);
                }
                return Optional.of(new Route(simplified, costs[id]));
            }
            int col = id % xx.length, row = id / xx.length;
            Point a = new Point(xx[col], yy[row]);
            for (int[] delta : new int[][]{{1,0},{-1,0},{0,1},{0,-1}}) {
                int nc = col + delta[0], nr = row + delta[1];
                if (nc < 0 || nr < 0 || nc >= xx.length || nr >= yy.length) continue;
                int next = nr * xx.length + nc;
                Point b = new Point(xx[nc], yy[nr]);
                double cost = costs[id] + distance(a,b);
                if (cost >= costs[next] || !clear(a,b,blocks)
                    || !com.marketmap.backend.layout.service.LayoutGeometry.clearSegment(polygon,
                        new com.marketmap.backend.layout.dto.LayoutVertex(a.x(),a.y()),
                        new com.marketmap.backend.layout.dto.LayoutVertex(b.x(),b.y()),CLEARANCE_CM)) continue;
                costs[next] = cost;
                previous[next] = id;
                queue.add(new Candidate(next, cost, cost + distanceToGoals(b,goals)));
            }
        }
        return Optional.empty();
    }

    private double distanceToGoals(Point point, List<Point> goals) {
        double best=Double.POSITIVE_INFINITY;
        for(Point goal:goals) best=Math.min(best,distance(point,goal));
        return best;
    }

    private double distance(Point a, Point b) { return Math.abs((double)a.x()-b.x()) + Math.abs((double)a.y()-b.y()); }
}