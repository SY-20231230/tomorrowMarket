package com.stock.tomorrowMarket.article.service;

import com.stock.tomorrowMarket.article.dto.ArticleResponse;
import com.stock.tomorrowMarket.article.entity.Article;
import com.stock.tomorrowMarket.article.repository.ArticleRepository;
import com.stock.tomorrowMarket.article.repository.ArticleSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ArticleService {

    private final ArticleRepository articleRepository;

    public Page<ArticleResponse> getArticles(Long stockId, Long sectorId, String category, Pageable pageable) {
        Specification<Article> spec = Specification.where(null);

        if (stockId != null) {
            spec = spec.and(ArticleSpecification.byStockId(stockId));
        } else if (sectorId != null) {
            spec = spec.and(ArticleSpecification.bySectorId(sectorId));
        } else if (category != null) {
            if ("지표".equals(category)) {
                spec = spec.and(ArticleSpecification.isIndicator());
            } else if ("시장".equals(category)) {
                spec = spec.and(ArticleSpecification.isMarket());
            }
        }

        Page<Article> articles = articleRepository.findAll(spec, pageable);
        return articles.map(ArticleResponse::from);
    }

    public com.stock.tomorrowMarket.article.dto.SentimentStatisticsResponse getSentimentStatistics(Long stockId, Long sectorId) {
        Specification<Article> spec = Specification.where(null);
        if (stockId != null) {
            spec = spec.and(ArticleSpecification.byStockId(stockId));
        } else if (sectorId != null) {
            spec = spec.and(ArticleSpecification.bySectorId(sectorId));
        }

        // Limit to last 30 days
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("registrationDate"), thirtyDaysAgo));

        List<Article> articles = articleRepository.findAll(spec);

        int pos = 0, neu = 0, neg = 0;
        Map<LocalDate, List<BigDecimal>> dailyScores = new TreeMap<>();
        Map<String, Integer> keywordCounts = new HashMap<>();

        for (Article a : articles) {
            if (a.getSentimentLabel() != null) {
                switch (a.getSentimentLabel().name()) {
                    case "POSITIVE" -> pos++;
                    case "NEUTRAL" -> neu++;
                    case "NEGATIVE" -> neg++;
                }
            }

            LocalDate date = a.getRegistrationDate().toLocalDate();
            dailyScores.computeIfAbsent(date, k -> new ArrayList<>()).add(a.getSentimentScore());

            if (a.getKeywords() != null && !a.getKeywords().isBlank()) {
                String[] kws = a.getKeywords().split(",");
                for (String kw : kws) {
                    String trimmed = kw.trim();
                    if (!trimmed.isEmpty()) {
                        keywordCounts.put(trimmed, keywordCounts.getOrDefault(trimmed, 0) + 1);
                    }
                }
            }
        }

        List<com.stock.tomorrowMarket.article.dto.SentimentStatisticsResponse.TrendData> trendDataList = dailyScores.entrySet().stream()
                .map(e -> {
                    BigDecimal sum = e.getValue().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal avg = sum.divide(new BigDecimal(e.getValue().size()), 5, RoundingMode.HALF_UP);
                    return com.stock.tomorrowMarket.article.dto.SentimentStatisticsResponse.TrendData.builder()
                            .date(e.getKey())
                            .averageScore(avg)
                            .build();
                })
                .collect(Collectors.toList());

        List<String> topKeywords = keywordCounts.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        return com.stock.tomorrowMarket.article.dto.SentimentStatisticsResponse.builder()
                .pieChart(com.stock.tomorrowMarket.article.dto.SentimentStatisticsResponse.PieChartData.builder()
                        .positive(pos).neutral(neu).negative(neg).build())
                .trendData(trendDataList)
                .relatedKeywords(topKeywords)
                .build();
    }
}
