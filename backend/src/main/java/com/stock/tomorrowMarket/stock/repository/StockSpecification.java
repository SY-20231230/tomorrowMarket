package com.stock.tomorrowMarket.stock.repository;

import com.stock.tomorrowMarket.stock.entity.MarketType;
import com.stock.tomorrowMarket.stock.entity.Stock;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class StockSpecification {

    public static Specification<Stock> searchStocks(String searchKeyword, Long sectorId, MarketType marketType) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Active stocks only
            predicates.add(cb.isTrue(root.get("isActive")));

            if (searchKeyword != null && !searchKeyword.isBlank()) {
                String keywordPattern = "%" + searchKeyword.toLowerCase() + "%";
                Predicate nameLike = cb.like(cb.lower(root.get("name")), keywordPattern);
                Predicate codeLike = cb.like(cb.lower(root.get("stockCode")), keywordPattern);
                predicates.add(cb.or(nameLike, codeLike));
            }

            if (sectorId != null) {
                predicates.add(cb.equal(root.join("sector").get("sectorsId"), sectorId));
            }

            if (marketType != null) {
                predicates.add(cb.equal(root.get("marketType"), marketType));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
