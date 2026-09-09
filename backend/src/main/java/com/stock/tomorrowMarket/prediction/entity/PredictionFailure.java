package com.stock.tomorrowMarket.prediction.entity;

import com.stock.tomorrowMarket.stock.entity.Stock;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "PREDICTION_FAILURES")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PredictionFailure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PREDICTION_FAILURE_ID")
    private Long predictionFailureId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PREDICTION_RUN_ID", nullable = false)
    private PredictionRun predictionRun;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STOCK_ID")
    private Stock stock;

    @Column(name = "PREDICTION_PERIOD")
    private Integer predictionPeriod;

    @Column(name = "FAILURE_STAGE", length = 50)
    private String failureStage;

    @Column(name = "ERROR_CODE", length = 50)
    private String errorCode;

    @Column(name = "ERROR_MESSAGE", nullable = false, columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "RETRY_STATUS", nullable = false, length = 20)
    private String retryStatus = "NOT_RETRIED"; // NOT_RETRIED, RETRYING, RESOLVED, RETRY_FAILED

    @Column(name = "RETRY_COUNT", nullable = false)
    private Integer retryCount = 0;

    @Column(name = "RESOLVED_AT")
    private LocalDateTime resolvedAt;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    public PredictionFailure(PredictionRun predictionRun, Stock stock, Integer predictionPeriod,
                             String failureStage, String errorCode, String errorMessage) {
        this.predictionRun = predictionRun;
        this.stock = stock;
        this.predictionPeriod = predictionPeriod;
        this.failureStage = failureStage;
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
        this.retryStatus = "NOT_RETRIED";
        this.retryCount = 0;
    }

    public void updateRetryStatus(String retryStatus) {
        this.retryStatus = retryStatus;
        if ("RESOLVED".equals(retryStatus)) {
            this.resolvedAt = LocalDateTime.now();
        }
    }

    public void incrementRetryCount() {
        this.retryCount++;
    }
}
