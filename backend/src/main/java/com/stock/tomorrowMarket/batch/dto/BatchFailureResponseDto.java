package com.stock.tomorrowMarket.batch.dto;

import com.stock.tomorrowMarket.prediction.entity.PredictionFailure;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class BatchFailureResponseDto {
    private Long predictionFailureId;
    private Long stockId;
    private Integer predictionPeriod;
    private String failureStage;
    private String errorCode;
    private String errorMessage;
    private String retryStatus;
    private Integer retryCount;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;

    public static BatchFailureResponseDto from(PredictionFailure failure) {
        return BatchFailureResponseDto.builder()
                .predictionFailureId(failure.getPredictionFailureId())
                .stockId(failure.getStock() != null ? failure.getStock().getStockId() : null)
                .predictionPeriod(failure.getPredictionPeriod())
                .failureStage(failure.getFailureStage())
                .errorCode(failure.getErrorCode())
                .errorMessage(failure.getErrorMessage())
                .retryStatus(failure.getRetryStatus())
                .retryCount(failure.getRetryCount())
                .resolvedAt(failure.getResolvedAt())
                .createdAt(failure.getCreatedAt())
                .build();
    }
}
