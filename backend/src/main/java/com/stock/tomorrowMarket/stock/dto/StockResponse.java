package com.stock.tomorrowMarket.stock.dto;

import com.stock.tomorrowMarket.stock.entity.Stock;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StockResponse {

    private Long stockId;
    private String name;
    private String stockCode;
    private String marketType;
    private Long sectorId;
    private String sectorName;
    private Integer closingPrice;
    private Double performance;

    public static StockResponse from(Stock stock) {
        return StockResponse.builder()
                .stockId(stock.getStockId())
                .name(stock.getName())
                .stockCode(stock.getStockCode())
                .marketType(stock.getMarketType() != null ? stock.getMarketType().name() : null)
                .sectorId(stock.getSector() != null ? stock.getSector().getSectorsId() : null)
                .sectorName(stock.getSector() != null ? stock.getSector().getName() : null)
                .build();
    }

    public static StockResponse of(Stock stock, com.stock.tomorrowMarket.stock.entity.StockHistory latestHistory) {
        return StockResponse.builder()
                .stockId(stock.getStockId())
                .name(stock.getName())
                .stockCode(stock.getStockCode())
                .marketType(stock.getMarketType() != null ? stock.getMarketType().name() : null)
                .sectorId(stock.getSector() != null ? stock.getSector().getSectorsId() : null)
                .sectorName(stock.getSector() != null ? stock.getSector().getName() : null)
                .closingPrice(latestHistory != null ? latestHistory.getClosingPrice().intValue() : null)
                .performance(latestHistory != null ? latestHistory.getPerformance().doubleValue() : null)
                .build();
    }
}
