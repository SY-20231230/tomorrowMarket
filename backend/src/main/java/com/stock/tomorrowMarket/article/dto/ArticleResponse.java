package com.stock.tomorrowMarket.article.dto;

import com.stock.tomorrowMarket.article.entity.Article;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class ArticleResponse {

    private Long articleId;
    private String title;
    private String summary;
    private String sentimentLabel;
    private BigDecimal sentimentScore;
    private List<String> tags;
    private LocalDateTime registrationDate;

    // Optional: Include stock or sector info if needed by frontend
    private Long stockId;
    private String stockName;
    private Long sectorId;
    private String sectorName;

    public static ArticleResponse from(Article article) {
        List<String> parsedTags = article.getKeywords() != null && !article.getKeywords().isBlank()
                ? Arrays.stream(article.getKeywords().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toList())
                : List.of();

        return ArticleResponse.builder()
                .articleId(article.getArticleId())
                .title(article.getTitle())
                .summary(article.getSummary())
                .sentimentLabel(article.getSentimentLabel().name())
                .sentimentScore(article.getSentimentScore())
                .tags(parsedTags)
                .registrationDate(article.getRegistrationDate())
                .stockId(article.getStock() != null ? article.getStock().getStockId() : null)
                .stockName(article.getStock() != null ? article.getStock().getName() : null)
                .sectorId(article.getSector() != null ? article.getSector().getSectorsId() : null)
                .sectorName(article.getSector() != null ? article.getSector().getName() : null)
                .build();
    }
}
