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
    private String content;
    private String url;
    private LocalDateTime registrationDate;

    // Flattened info from Article
    private String symbol;
    private String stockName;
    private String industry;
    private String source;

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
                .sentimentLabel(article.getSentimentLabel())
                .sentimentScore(article.getSentimentScore())
                .tags(parsedTags)
                .content(article.getContent())
                .url(article.getUrl())
                .registrationDate(article.getNewsDate())
                .symbol(article.getSymbol())
                .stockName(article.getStockName())
                .industry(article.getIndustry())
                .source(article.getMedia())
                .build();
    }
}
