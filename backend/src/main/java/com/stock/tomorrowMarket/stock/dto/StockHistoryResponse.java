package com.stock.tomorrowMarket.stock.dto;

import com.stock.tomorrowMarket.stock.entity.StockHistory;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class StockHistoryResponse {

    private LocalDate date;
    private BigDecimal openPrice;
    private BigDecimal highPrice;
    private BigDecimal lowPrice;
    private BigDecimal closingPrice;
    private Long volume;
    private BigDecimal performance;

    public static StockHistoryResponse from(StockHistory history) {
        return StockHistoryResponse.builder()
                .date(history.getHistoryDate())
                .openPrice(history.getOpenPrice())
                .highPrice(history.getHighPrice())
                .lowPrice(history.getLowPrice())
                .closingPrice(history.getClosingPrice())
                .volume(history.getVolume())
                .performance(history.getPerformance())
                .build();
    }
}
