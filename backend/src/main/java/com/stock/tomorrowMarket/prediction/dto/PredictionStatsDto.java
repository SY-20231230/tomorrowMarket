package com.stock.tomorrowMarket.prediction.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
@AllArgsConstructor
public class PredictionStatsDto {
    private Long targetId; // StockId or ModelId (represented as string if needed, let's keep it simple for now)
    private String targetName; // StockName or ModelName
    private Long totalEvaluations;
    private Long correctDirections;
    private BigDecimal directionAccuracy; // (correctDirections / totalEvaluations) * 100
    private BigDecimal averageErrorRate; // average of errorRate
}
