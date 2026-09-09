package com.stock.tomorrowMarket.log.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
@AllArgsConstructor
public class AccessLogStatsDto {
    private Long totalAccessCount;
    private Map<String, Long> accessBySource;
}
