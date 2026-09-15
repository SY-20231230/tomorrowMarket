package com.stock.tomorrowMarket.prediction.dto;

import com.stock.tomorrowMarket.prediction.entity.PredictionEvaluation;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class PredictionEvaluationDto {
    private Long predictionEvaluationId;
    private BigDecimal actualPrice;
    private BigDecimal priceDifference;
    private BigDecimal absoluteError;
    private BigDecimal errorRate;
    private BigDecimal actualReturnRate;
    private String actualDirection;
    private Boolean directionCorrect;
    private LocalDateTime evaluatedAt;

    public static PredictionEvaluationDto from(PredictionEvaluation evaluation) {
        if (evaluation == null) return null;
        return PredictionEvaluationDto.builder()
                .predictionEvaluationId(evaluation.getPredictionEvaluationId())
                .actualPrice(evaluation.getActualPrice())
                .priceDifference(evaluation.getPriceDifference())
                .absoluteError(evaluation.getAbsoluteError())
                .errorRate(evaluation.getErrorRate())
                .actualReturnRate(evaluation.getActualReturnRate())
                .actualDirection(evaluation.getActualDirection())
                .directionCorrect(evaluation.getDirectionCorrect())
                .evaluatedAt(evaluation.getEvaluatedAt())
                .build();
    }
}
