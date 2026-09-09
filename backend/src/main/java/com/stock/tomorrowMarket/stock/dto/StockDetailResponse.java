package com.stock.tomorrowMarket.stock.dto;

import com.stock.tomorrowMarket.stock.entity.Stock;
import com.stock.tomorrowMarket.stock.entity.StockHistory;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class StockDetailResponse {

    private Long stockId;
    private String name;
    private String stockCode;
    private String marketType;
    private Long sectorId;
    private String sectorName;

    // Latest history data
    private BigDecimal closingPrice;
    private BigDecimal performance;
    private LocalDate lastUpdated;

    public static StockDetailResponse of(Stock stock, StockHistory latestHistory) {
        return StockDetailResponse.builder()
                .stockId(stock.getStockId())
                .name(stock.getName())
                .stockCode(stock.getStockCode())
                .marketType(stock.getMarketType() != null ? stock.getMarketType().name() : null)
                .sectorId(stock.getSector() != null ? stock.getSector().getSectorsId() : null)
                .sectorName(stock.getSector() != null ? stock.getSector().getName() : null)
                .closingPrice(latestHistory != null ? latestHistory.getClosingPrice() : null)
                .performance(latestHistory != null ? latestHistory.getPerformance() : null)
                .lastUpdated(latestHistory != null ? latestHistory.getHistoryDate() : null)
                .build();
    }
}
