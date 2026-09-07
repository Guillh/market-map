package com.marketmap.backend.navigation.repository;

import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import com.marketmap.backend.navigation.dto.NavigationElement;
import com.marketmap.backend.navigation.dto.NavigationElement.Kind;

@Repository
public class NavigationRepository {
    private final JdbcTemplate jdbc;
    public NavigationRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public List<NavigationElement> findAll() {
        return jdbc.query("SELECT * FROM navigation_elements ORDER BY name, id", (rs, row) ->
            new NavigationElement(rs.getObject("id", UUID.class), rs.getObject("layout_id", UUID.class),
                Kind.valueOf(rs.getString("kind")), rs.getString("name"), rs.getInt("x_cm"),
                rs.getInt("y_cm"), rs.getInt("width_cm"), rs.getInt("height_cm"),
                rs.getObject("shelf_id", UUID.class)));
    }

    public NavigationElement save(UUID id, NavigationElement e) {
        jdbc.update("""
            INSERT INTO navigation_elements(id, layout_id, kind, name, x_cm, y_cm, width_cm, height_cm, shelf_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (id) DO UPDATE SET layout_id=excluded.layout_id, kind=excluded.kind,
            name=excluded.name, x_cm=excluded.x_cm, y_cm=excluded.y_cm,
            width_cm=excluded.width_cm, height_cm=excluded.height_cm, shelf_id=excluded.shelf_id
            """, id, e.layoutId(), e.kind().name(), e.name().trim(), e.xCm(), e.yCm(), e.widthCm(), e.heightCm(), e.shelfId());
        return new NavigationElement(id, e.layoutId(), e.kind(), e.name().trim(), e.xCm(), e.yCm(), e.widthCm(), e.heightCm(), e.shelfId());
    }

    public int delete(UUID id) { return jdbc.update("DELETE FROM navigation_elements WHERE id = ?", id); }
}