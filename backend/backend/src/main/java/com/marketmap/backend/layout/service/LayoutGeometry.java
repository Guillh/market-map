package com.marketmap.backend.layout.service;

import java.util.*;
import com.marketmap.backend.layout.Layout;
import com.marketmap.backend.layout.dto.LayoutVertex;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** Simple polygon geometry shared by layout validation and navigation. Coordinates are centimeters. */
public final class LayoutGeometry {
    private static final double EPS = 1e-7;
    private LayoutGeometry() {}

    public static List<LayoutVertex> boundary(Layout layout) {
        return effective(layout.getWidthCm(), layout.getHeightCm(),
            layout.getBoundary().stream().map(v -> new LayoutVertex(v.getX(),v.getY())).toList());
    }

    public static List<LayoutVertex> effective(int width, int height, List<LayoutVertex> points) {
        return points == null || points.isEmpty() ? List.of(new LayoutVertex(0,0), new LayoutVertex(width,0),
            new LayoutVertex(width,height), new LayoutVertex(0,height)) : points;
    }

    public static void validate(int width, int height, List<LayoutVertex> points) {
        if (points == null || points.isEmpty()) return;
        if (points.size() < 3 || points.size() > 60) invalid("O contorno precisa ter entre 3 e 60 vértices.");
        if (new HashSet<>(points).size() != points.size()) invalid("O contorno não pode repetir vértices.");
        double area = 0;
        for (int i=0; i<points.size(); i++) {
            LayoutVertex a=points.get(i), b=points.get((i+1)%points.size());
            if (a.x()<0 || a.y()<0 || a.x()>width || a.y()>height) invalid("Todos os vértices devem ficar dentro das dimensões do layout.");
            area += (double)a.x()*b.y()-(double)b.x()*a.y();
            LayoutVertex c=points.get((i+2)%points.size());
            if (Math.abs(cross(a,b,c)) < EPS) invalid("Remova os vértices alinhados ou sobrepostos no contorno.");
            for (int j=i+1; j<points.size(); j++) {
                if (j==i+1 || (i==0 && j==points.size()-1)) continue;
                if (intersects(a,b,points.get(j),points.get((j+1)%points.size()))) invalid("As paredes do contorno não podem se cruzar.");
            }
        }
        if (Math.abs(area)<EPS) invalid("O contorno precisa formar uma área.");
    }

    public static boolean contains(List<LayoutVertex> polygon, LayoutVertex p) {
        boolean inside=false;
        for (int i=0,j=polygon.size()-1; i<polygon.size(); j=i++) {
            LayoutVertex a=polygon.get(j), b=polygon.get(i);
            if (pointDistance(p,a,b)<EPS) return true;
            if ((a.y()>p.y()) != (b.y()>p.y()) && p.x() < (double)(b.x()-a.x())*(p.y()-a.y())/(b.y()-a.y())+a.x()) inside=!inside;
        }
        return inside;
    }

    public static boolean free(List<LayoutVertex> polygon, LayoutVertex p, double clearance) {
        if (!contains(polygon,p)) return false;
        for (int i=0; i<polygon.size(); i++)
            if (pointDistance(p,polygon.get(i),polygon.get((i+1)%polygon.size())) < clearance-EPS) return false;
        return true;
    }

    public static boolean clearSegment(List<LayoutVertex> polygon, LayoutVertex a, LayoutVertex b, double clearance) {
        if (!free(polygon,a,clearance) || !free(polygon,b,clearance)) return false;
        for (int i=0; i<polygon.size(); i++) {
            LayoutVertex c=polygon.get(i), d=polygon.get((i+1)%polygon.size());
            if (segmentDistance(a,b,c,d) < clearance-EPS) return false;
        }
        return true;
    }

    public static boolean containsRectangle(List<LayoutVertex> polygon, int x, int y, int width, int height) {
        if (width<=0 || height<=0 || (long)x+width>Integer.MAX_VALUE || (long)y+height>Integer.MAX_VALUE) return false;
        var corners=List.of(new LayoutVertex(x,y),new LayoutVertex(x+width,y),new LayoutVertex(x+width,y+height),new LayoutVertex(x,y+height));
        if (corners.stream().anyMatch(p -> !contains(polygon,p))) return false;
        // A concave indentation may cross the rectangle even if all four corners are inside.
        for (int i=0;i<polygon.size();i++) {
            LayoutVertex a=polygon.get(i),b=polygon.get((i+1)%polygon.size());
            if (a.x()>x && a.x()<x+width && a.y()>y && a.y()<y+height) return false;
            for (int j=0;j<4;j++) {
                LayoutVertex c=corners.get(j),d=corners.get((j+1)%4);
                if (cross(a,b,c)*cross(a,b,d)<-EPS && cross(c,d,a)*cross(c,d,b)<-EPS) return false;
            }
            // Test each wall interval after clipping to the rectangle; boundary contact is allowed.
            double lo=0,hi=1;
            double[] p={-(double)(b.x()-a.x()), b.x()-a.x(), -(double)(b.y()-a.y()), b.y()-a.y()};
            double[] q={a.x()-(double)x, (double)x+width-a.x(), a.y()-(double)y, (double)y+height-a.y()};
            boolean clipped=true;
            for(int k=0;k<4;k++) {
                if(Math.abs(p[k])<EPS) { if(q[k]<0) clipped=false; }
                else if(p[k]<0) lo=Math.max(lo,q[k]/p[k]);
                else hi=Math.min(hi,q[k]/p[k]);
            }
            if(clipped && lo<hi) {
                double t=(lo+hi)/2, px=a.x()+t*(b.x()-a.x()),py=a.y()+t*(b.y()-a.y());
                if(px>x+EPS && px<x+width-EPS && py>y+EPS && py<y+height-EPS) return false;
            }
        }
        return true;
    }

    private static double cross(LayoutVertex a,LayoutVertex b,LayoutVertex c) {
        return ((double)b.x()-a.x())*((double)c.y()-a.y())-((double)b.y()-a.y())*((double)c.x()-a.x());
    }
    private static boolean intersects(LayoutVertex a,LayoutVertex b,LayoutVertex c,LayoutVertex d) {
        if(cross(a,b,c)*cross(a,b,d)<0 && cross(c,d,a)*cross(c,d,b)<0) return true;
        return pointDistance(a,c,d)<EPS || pointDistance(b,c,d)<EPS || pointDistance(c,a,b)<EPS || pointDistance(d,a,b)<EPS;
    }
    private static double pointDistance(LayoutVertex p,LayoutVertex a,LayoutVertex b) {
        double dx=(double)b.x()-a.x(),dy=(double)b.y()-a.y();
        double t=dx==0 && dy==0 ? 0 : Math.max(0,Math.min(1,(((double)p.x()-a.x())*dx+((double)p.y()-a.y())*dy)/(dx*dx+dy*dy)));
        return Math.hypot(p.x()-a.x()-t*dx,p.y()-a.y()-t*dy);
    }
    private static double segmentDistance(LayoutVertex a,LayoutVertex b,LayoutVertex c,LayoutVertex d) {
        return intersects(a,b,c,d) ? 0 : Math.min(Math.min(pointDistance(a,c,d),pointDistance(b,c,d)),Math.min(pointDistance(c,a,b),pointDistance(d,a,b)));
    }
    private static void invalid(String message) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST,message); }
}