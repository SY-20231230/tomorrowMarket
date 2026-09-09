package com.stock.tomorrowMarket.prediction.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "PREDICTION_RUNS")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PredictionRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PREDICTION_RUN_ID")
    private Long predictionRunId;

    @Column(name = "RUN_TYPE", nullable = false, length = 30)
    private String runType; // WEEKLY_SHORT, MONTHLY_LONG, ON_DEMAND, DAILY_EVALUATION

    @Column(name = "SCHEDULED_BASE_DATE", nullable = false)
    private LocalDate scheduledBaseDate;

    @Column(name = "DATA_CUTOFF_DATETIME")
    private LocalDateTime dataCutoffDatetime;

    @Column(name = "MODEL_NAME", length = 100)
    private String modelName;

    @Column(name = "MODEL_VERSION", length = 50)
    private String modelVersion;

    @Column(name = "RUN_STATUS", nullable = false, length = 30)
    private String runStatus = "PENDING"; // PENDING, RUNNING, SUCCESS, PARTIAL_SUCCESS, FAILED

    @Column(name = "TOTAL_STOCK_COUNT", nullable = false)
    private Integer totalStockCount = 0;

    @Column(name = "EXPECTED_RESULT_COUNT", nullable = false)
    private Integer expectedResultCount = 0;

    @Column(name = "SUCCESS_COUNT", nullable = false)
    private Integer successCount = 0;

    @Column(name = "FAILURE_COUNT", nullable = false)
    private Integer failureCount = 0;

    @Column(name = "STARTED_AT")
    private LocalDateTime startedAt;

    @Column(name = "FINISHED_AT")
    private LocalDateTime finishedAt;

    @Column(name = "ERROR_MESSAGE", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    public PredictionRun(String runType, LocalDate scheduledBaseDate, LocalDateTime dataCutoffDatetime,
                         String modelName, String modelVersion, Integer totalStockCount,
                         Integer expectedResultCount) {
        this.runType = runType;
        this.scheduledBaseDate = scheduledBaseDate;
        this.dataCutoffDatetime = dataCutoffDatetime;
        this.modelName = modelName;
        this.modelVersion = modelVersion;
        this.totalStockCount = totalStockCount != null ? totalStockCount : 0;
        this.expectedResultCount = expectedResultCount != null ? expectedResultCount : 0;
        this.runStatus = "PENDING";
        this.successCount = 0;
        this.failureCount = 0;
    }

    public void startRun() {
        this.runStatus = "RUNNING";
        this.startedAt = LocalDateTime.now();
    }

    public void finishRun(String runStatus, Integer successCount, Integer failureCount, String errorMessage) {
        this.runStatus = runStatus;
        this.successCount = successCount;
        this.failureCount = failureCount;
        this.errorMessage = errorMessage;
        this.finishedAt = LocalDateTime.now();
    }
}
