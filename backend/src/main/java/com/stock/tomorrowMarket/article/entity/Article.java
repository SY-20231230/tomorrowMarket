package com.stock.tomorrowMarket.article.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ARTICLES")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ARTICLE_ID")
    private Long articleId;

    @Column(name = "NEWS_DATE")
    private LocalDateTime newsDate;

    @Column(name = "MEDIA", length = 100)
    private String media;

    @Column(name = "REPORTER", length = 100)
    private String reporter;

    @Column(name = "TITLE")
    private String title;

    @Column(name = "SUMMARY", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "CONTENT", columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "URL", length = 500)
    private String url;

    @Column(name = "SYMBOL", length = 20)
    private String symbol;

    @Column(name = "STOCK_NAME", length = 100)
    private String stockName;

    @Column(name = "INDUSTRY", length = 100)
    private String industry;

    @Column(name = "SEARCH_KEYWORD", length = 100)
    private String searchKeyword;

    @Column(name = "KEYWORDS", length = 500)
    private String keywords;

    // Use String instead of Enum to match Python AI logic flawlessly
    @Column(name = "SENTIMENT_LABEL", length = 20)
    private String sentimentLabel;

    @Column(name = "SENTIMENT_SCORE", precision = 10, scale = 5)
    private BigDecimal sentimentScore;

    @Column(name = "POSITIVE_PROB", precision = 10, scale = 5)
    private BigDecimal positiveProb;

    @Column(name = "NEUTRAL_PROB", precision = 10, scale = 5)
    private BigDecimal neutralProb;

    @Column(name = "NEGATIVE_PROB", precision = 10, scale = 5)
    private BigDecimal negativeProb;

    @Column(name = "MODEL_NAME", length = 100)
    private String modelName;

    @Column(name = "MODEL_VERSION", length = 100)
    private String modelVersion;

    @Column(name = "SENTIMENT_CREATED_AT")
    private LocalDateTime sentimentCreatedAt;

    @Builder
    public Article(Long articleId, LocalDateTime newsDate, String media, String reporter, String title, String summary, String content, String url, String symbol, String stockName, String industry, String searchKeyword, String keywords, String sentimentLabel, BigDecimal sentimentScore, BigDecimal positiveProb, BigDecimal neutralProb, BigDecimal negativeProb, String modelName, String modelVersion, LocalDateTime sentimentCreatedAt) {
        this.articleId = articleId;
        this.newsDate = newsDate;
        this.media = media;
        this.reporter = reporter;
        this.title = title;
        this.summary = summary;
        this.content = content;
        this.url = url;
        this.symbol = symbol;
        this.stockName = stockName;
        this.industry = industry;
        this.searchKeyword = searchKeyword;
        this.keywords = keywords;
        this.sentimentLabel = sentimentLabel;
        this.sentimentScore = sentimentScore;
        this.positiveProb = positiveProb;
        this.neutralProb = neutralProb;
        this.negativeProb = negativeProb;
        this.modelName = modelName;
        this.modelVersion = modelVersion;
        this.sentimentCreatedAt = sentimentCreatedAt;
    }
}
