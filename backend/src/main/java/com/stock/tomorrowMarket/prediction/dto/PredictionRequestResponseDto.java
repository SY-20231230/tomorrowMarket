package com.stock.tomorrowMarket.prediction.dto;

import com.stock.tomorrowMarket.prediction.entity.PredictionRequest;
import com.stock.tomorrowMarket.prediction.entity.RequestStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PredictionRequestResponseDto {
    private Long predictionRequestId;
    private Long stockId;
    private RequestStatus status;
    private String failureReason;
    private LocalDateTime requestedAt;
    private LocalDateTime completedAt;

    public static PredictionRequestResponseDto from(PredictionRequest request) {
        return PredictionRequestResponseDto.builder()
                .predictionRequestId(request.getPredictionRequestId())
                .stockId(request.getStock() != null ? request.getStock().getStockId() : null)
                .status(request.getRequestStatus())
                .failureReason(request.getFailureReason())
                .requestedAt(request.getRequestedAt())
                .completedAt(request.getCompletedAt())
                .build();
    }
}
