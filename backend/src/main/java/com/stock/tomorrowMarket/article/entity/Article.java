package com.stock.tomorrowMarket.article.entity;

import com.stock.tomorrowMarket.sector.entity.Sector;
import com.stock.tomorrowMarket.stock.entity.Stock;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SECTORS_ID")
    private Sector sector;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STOCK_ID")
    private Stock stock;

    @Column(name = "TITLE", nullable = false)
    private String title;

    @Column(name = "SUMMARY", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "CONFIDENCE_SCORE", precision = 6, scale = 5)
    private BigDecimal confidenceScore;

    @Column(name = "SENTIMENT_SCORE", precision = 6, scale = 5)
    private BigDecimal sentimentScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "SENTIMENT_LABEL")
    private SentimentLabel sentimentLabel;

    @Column(name = "KEYWORDS", length = 500)
    private String keywords;

    @Column(name = "REGISTRATION_DATE", nullable = false)
    private LocalDateTime registrationDate;

    @Builder
    public Article(Sector sector, Stock stock, String title, String summary, BigDecimal confidenceScore, BigDecimal sentimentScore, SentimentLabel sentimentLabel, String keywords, LocalDateTime registrationDate) {
        this.sector = sector;
        this.stock = stock;
        this.title = title;
        this.summary = summary;
        this.confidenceScore = confidenceScore;
        this.sentimentScore = sentimentScore;
        this.sentimentLabel = sentimentLabel;
        this.keywords = keywords;
        this.registrationDate = registrationDate;
    }
}
