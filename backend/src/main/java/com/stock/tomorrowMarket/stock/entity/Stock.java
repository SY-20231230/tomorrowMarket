package com.stock.tomorrowMarket.stock.entity;

import com.stock.tomorrowMarket.sector.entity.Sector;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "STOCKS")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "STOCK_ID")
    private Long stockId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SECTORS_ID")
    private Sector sector;

    @Column(name = "NAME", nullable = false)
    private String name;

    @Column(name = "STOCK_CODE", nullable = false, unique = true)
    private String stockCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "MARKET_TYPE")
    private MarketType marketType;

    @Column(name = "IS_ACTIVE", nullable = false)
    private boolean isActive;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    public Stock(Sector sector, String name, String stockCode, MarketType marketType, boolean isActive) {
        this.sector = sector;
        this.name = name;
        this.stockCode = stockCode;
        this.marketType = marketType;
        this.isActive = isActive;
    }

    public void changeActiveStatus(boolean isActive) {
        this.isActive = isActive;
    }
}
