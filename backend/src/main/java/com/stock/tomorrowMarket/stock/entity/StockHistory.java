package com.stock.tomorrowMarket.stock.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(
    name = "STOCKS_HISTORY",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"STOCK_ID", "HISTORY_DATE"})
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StockHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "STOCKS_HISTORY_ID")
    private Long stocksHistoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STOCK_ID", nullable = false)
    private Stock stock;

    @Column(name = "STOCK_CODE", nullable = false, length = 20)
    private String stockCode;

    @Column(name = "OPEN_PRICE", nullable = false, precision = 15, scale = 2)
    private BigDecimal openPrice;

    @Column(name = "HIGH_PRICE", nullable = false, precision = 15, scale = 2)
    private BigDecimal highPrice;

    @Column(name = "LOW_PRICE", nullable = false, precision = 15, scale = 2)
    private BigDecimal lowPrice;

    @Column(name = "CLOSING_PRICE", nullable = false, precision = 15, scale = 2)
    private BigDecimal closingPrice;

    @Column(name = "VOLUME", nullable = false)
    private Long volume;

    @Column(name = "PERFORMANCE", nullable = false, precision = 10, scale = 4)
    private BigDecimal performance;

    @Column(name = "HISTORY_DATE", nullable = false)
    private LocalDate historyDate;

    @Builder
    public StockHistory(Stock stock, String stockCode, BigDecimal openPrice, BigDecimal highPrice, BigDecimal lowPrice, BigDecimal closingPrice, Long volume, BigDecimal performance, LocalDate historyDate) {
        this.stock = stock;
        this.stockCode = stockCode;
        this.openPrice = openPrice;
        this.highPrice = highPrice;
        this.lowPrice = lowPrice;
        this.closingPrice = closingPrice;
        this.volume = volume;
        this.performance = performance;
        this.historyDate = historyDate;
    }
}
