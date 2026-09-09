package com.stock.tomorrowMarket.article.repository;

import com.stock.tomorrowMarket.article.entity.Article;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ArticleSpecification {

    private static final List<String> INDICATOR_KEYWORDS = List.of(
            "금리", "환율", "CPI", "GDP", "물가", "고용", "실업률", "수출", "수입", "무역", "FOMC", "연준"
    );

    public static Specification<Article> byStockId(Long stockId) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.join("stock").get("stockId"), stockId);
    }

    public static Specification<Article> bySectorId(Long sectorId) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.join("sector").get("sectorId"), sectorId);
    }

    public static Specification<Article> isIndicator() {
        return (root, query, criteriaBuilder) -> {
            Predicate stockIsNull = criteriaBuilder.isNull(root.get("stock"));
            Predicate sectorIsNull = criteriaBuilder.isNull(root.get("sector"));

            List<Predicate> keywordPredicates = new ArrayList<>();
            for (String keyword : INDICATOR_KEYWORDS) {
                keywordPredicates.add(criteriaBuilder.like(root.get("keywords"), "%" + keyword + "%"));
                keywordPredicates.add(criteriaBuilder.like(root.get("title"), "%" + keyword + "%"));
            }
            Predicate hasKeyword = criteriaBuilder.or(keywordPredicates.toArray(new Predicate[0]));

            return criteriaBuilder.and(stockIsNull, sectorIsNull, hasKeyword);
        };
    }

    public static Specification<Article> isMarket() {
        return (root, query, criteriaBuilder) -> {
            Predicate stockIsNull = criteriaBuilder.isNull(root.get("stock"));
            Predicate sectorIsNull = criteriaBuilder.isNull(root.get("sector"));

            List<Predicate> keywordPredicates = new ArrayList<>();
            for (String keyword : INDICATOR_KEYWORDS) {
                keywordPredicates.add(criteriaBuilder.like(root.get("keywords"), "%" + keyword + "%"));
                keywordPredicates.add(criteriaBuilder.like(root.get("title"), "%" + keyword + "%"));
            }
            Predicate hasNoKeyword = criteriaBuilder.not(criteriaBuilder.or(keywordPredicates.toArray(new Predicate[0])));

            return criteriaBuilder.and(stockIsNull, sectorIsNull, hasNoKeyword);
        };
    }
}
