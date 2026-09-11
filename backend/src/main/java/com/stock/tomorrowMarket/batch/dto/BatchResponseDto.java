package com.stock.tomorrowMarket.batch.dto;

import com.stock.tomorrowMarket.prediction.entity.PredictionRun;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class BatchResponseDto {
    private Long predictionRunId;
    private String runType;
    private LocalDate scheduledBaseDate;
    private LocalDateTime dataCutoffDatetime;
    private String modelName;
    private String modelVersion;
    private String runStatus;
    private Integer totalStockCount;
    private Integer expectedResultCount;
    private Integer successCount;
    private Integer failureCount;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private String errorMessage;
    private LocalDateTime createdAt;

    public static BatchResponseDto from(PredictionRun run) {
        return BatchResponseDto.builder()
                .predictionRunId(run.getPredictionRunId())
                .runType(run.getRunType())
                .scheduledBaseDate(run.getScheduledBaseDate())
                .dataCutoffDatetime(run.getDataCutoffDatetime())
                .modelName(run.getModelName())
                .modelVersion(run.getModelVersion())
                .runStatus(run.getRunStatus())
                .totalStockCount(run.getTotalStockCount())
                .expectedResultCount(run.getExpectedResultCount())
                .successCount(run.getSuccessCount())
                .failureCount(run.getFailureCount())
                .startedAt(run.getStartedAt())
                .finishedAt(run.getFinishedAt())
                .errorMessage(run.getErrorMessage())
                .createdAt(run.getCreatedAt())
                .build();
    }
}
