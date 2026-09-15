package com.stock.tomorrowMarket.user.dto;

import com.stock.tomorrowMarket.prediction.entity.PredictionRequest;
import com.stock.tomorrowMarket.prediction.entity.RequestStatus;
import com.stock.tomorrowMarket.prediction.entity.ResultSource;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserPredictionRequestResponse {

    private Long predictionRequestId;
    private Long stockId;
    private String stockName;
    private String stockCode;
    private RequestStatus requestStatus;
    private ResultSource resultSource;
    private LocalDateTime requestedAt;
    private LocalDateTime completedAt;
    private String failureReason;

    public static UserPredictionRequestResponse from(PredictionRequest entity) {
        return UserPredictionRequestResponse.builder()
                .predictionRequestId(entity.getPredictionRequestId())
                .stockId(entity.getStock().getStockId())
                .stockName(entity.getStock().getName())
                .stockCode(entity.getStock().getStockCode())
                .requestStatus(entity.getRequestStatus())
                .resultSource(entity.getResultSource())
                .requestedAt(entity.getRequestedAt())
                .completedAt(entity.getCompletedAt())
                .failureReason(entity.getFailureReason())
                .build();
    }
}
