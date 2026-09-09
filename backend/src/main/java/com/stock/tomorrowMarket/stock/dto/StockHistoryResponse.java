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
    private BigDecimal closingPrice;
    private BigDecimal performance;

    public static StockHistoryResponse from(StockHistory history) {
        return StockHistoryResponse.builder()
                .date(history.getHistoryDate())
                .closingPrice(history.getClosingPrice())
                .performance(history.getPerformance())
                .build();
    }
}
