package com.stock.tomorrowMarket.log.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SearchLogStatsDto {
    private Long stockId;
    private String stockName;
    private Long searchCount;
}
