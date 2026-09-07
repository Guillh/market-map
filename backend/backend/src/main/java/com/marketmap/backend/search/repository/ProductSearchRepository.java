package com.marketmap.backend.search.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.marketmap.backend.product.ProductLocation;
import com.marketmap.backend.search.dto.ProductSearchResult;

public interface ProductSearchRepository extends JpaRepository<ProductLocation, UUID> {

    @Query("""
            select new com.marketmap.backend.search.dto.ProductSearchResult(
                product.id,
                product.name,
                product.sku,
                product.brand,
                new com.marketmap.backend.search.dto.ProductSearchLocation(
                    store.id,
                    store.name,
                    layout.id,
                    layout.name,
                    layout.widthCm,
                    layout.heightCm,
                    shelf.id,
                    shelf.name,
                    shelf.positionXCm,
                    shelf.positionYCm,
                    shelf.widthCm,
                    shelf.heightCm,
                    shelfSection.id,
                    shelfSection.name,
                    shelfSection.levelIndex,
                    shelfSection.positionIndex
                )
            )
            from ProductLocation productLocation
            join productLocation.product product
            join productLocation.shelfSection shelfSection
            join shelfSection.shelf shelf
            join shelf.layout layout
            join layout.store store
            where (
                lower(product.name) like lower(concat('%', :query, '%'))
                or lower(product.sku) like lower(concat('%', :query, '%'))
                or lower(product.brand) like lower(concat('%', :query, '%'))
            )
            and (:storeId is null or store.id = :storeId)
            order by product.name, store.name, shelf.name, shelfSection.levelIndex, shelfSection.positionIndex
            """)
    List<ProductSearchResult> searchProducts(@Param("query") String query, @Param("storeId") UUID storeId);

    @Query("""
        select p from Product p
        where (lower(p.name) like lower(concat('%', :query, '%'))
          or lower(p.sku) like lower(concat('%', :query, '%'))
          or lower(p.brand) like lower(concat('%', :query, '%')))
        and (:layoutId is null
          or exists (select loc.id from ProductLocation loc where loc.product = p and loc.shelfSection.shelf.layout.id = :layoutId)
          or not exists (select loc.id from ProductLocation loc where loc.product = p))
        order by p.name, p.id
        """)
    List<com.marketmap.backend.product.Product> suggestions(@Param("query") String query,
        @Param("layoutId") UUID layoutId, org.springframework.data.domain.Pageable page);    @Query("""
select new com.marketmap.backend.search.dto.ProductSearchResult(
                product.id,
                product.name,
                product.sku,
                product.brand,
                new com.marketmap.backend.search.dto.ProductSearchLocation(
                    store.id,
                    store.name,
                    layout.id,
                    layout.name,
                    layout.widthCm,
                    layout.heightCm,
                    shelf.id,
                    shelf.name,
                    shelf.positionXCm,
                    shelf.positionYCm,
                    shelf.widthCm,
                    shelf.heightCm,
                    shelfSection.id,
                    shelfSection.name,
                    shelfSection.levelIndex,
                    shelfSection.positionIndex
                )
            )
            from ProductLocation productLocation
            join productLocation.product product
            join productLocation.shelfSection shelfSection
            join shelfSection.shelf shelf
            join shelf.layout layout
            join layout.store store
            where product.id in :productIds and (:layoutId is null or layout.id = :layoutId)
            order by product.name, shelf.name, shelfSection.levelIndex, shelfSection.positionIndex
            """)
    List<ProductSearchResult> locationsForProducts(@Param("productIds") List<UUID> productIds, @Param("layoutId") UUID layoutId);
}
