package com.stock.tomorrowMarket.prediction.dto;

import com.stock.tomorrowMarket.prediction.entity.Prediction;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class PredictionResponseDto {
    private Long predictionId;
    private Long stockId;
    private String stockName;
    private String stockCode;
    private BigDecimal predictionPrice;
    private LocalDate targetDate;
    private String predictionSource;
    private Integer predictionPeriod;
    private LocalDate baseDate;
    private BigDecimal basePrice;
    private BigDecimal predictedReturnRate;
    private String predictedDirection;

    public static PredictionResponseDto from(Prediction prediction) {
        return PredictionResponseDto.builder()
                .predictionId(prediction.getPredictionId())
                .stockId(prediction.getStock() != null ? prediction.getStock().getStockId() : null)
                .stockName(prediction.getStock() != null ? prediction.getStock().getName() : null)
                .stockCode(prediction.getStock() != null ? prediction.getStock().getStockCode() : null)
                .predictionPrice(prediction.getPredictionPrice())
                .targetDate(prediction.getTargetDate())
                .predictionSource(prediction.getPredictionSource())
                .predictionPeriod(prediction.getPredictionPeriod())
                .baseDate(prediction.getBaseDate())
                .basePrice(prediction.getBasePrice())
                .predictedReturnRate(prediction.getPredictedReturnRate())
                .predictedDirection(prediction.getPredictedDirection())
                .build();
    }
}
