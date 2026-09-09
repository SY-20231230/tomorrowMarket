package com.stock.tomorrowMarket.prediction.entity;

import com.stock.tomorrowMarket.stock.entity.Stock;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "PREDICTIONS")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PREDICTION_ID")
    private Long predictionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STOCK_ID")
    private Stock stock;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PREDICTION_RUN_ID", nullable = false)
    private PredictionRun predictionRun;

    @Column(name = "PREDICTION_PRICE", precision = 15, scale = 2)
    private BigDecimal predictionPrice;

    @Column(name = "TARGET_DATE", nullable = false)
    private LocalDate targetDate;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "PREDICTION_SOURCE", nullable = false, length = 30)
    private String predictionSource; // SCHEDULED_WEEKLY, SCHEDULED_MONTHLY, ON_DEMAND

    @Column(name = "PREDICTION_PERIOD", nullable = false)
    private Integer predictionPeriod;

    @Column(name = "BASE_DATE", nullable = false)
    private LocalDate baseDate;

    @Column(name = "BASE_DATETIME")
    private LocalDateTime baseDatetime;

    @Column(name = "BASE_PRICE", nullable = false, precision = 15, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "PREDICTED_RETURN_RATE", precision = 10, scale = 4)
    private BigDecimal predictedReturnRate;

    @Column(name = "PREDICTED_DIRECTION", length = 10)
    private String predictedDirection; // UP, DOWN, FLAT

    @Column(name = "MODEL_NAME", length = 100)
    private String modelName;

    @Column(name = "MODEL_VERSION", length = 50)
    private String modelVersion;

    @Column(name = "EVALUATION_STATUS", nullable = false, length = 20)
    private String evaluationStatus = "WAITING"; // WAITING, COMPLETED, FAILED

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    public Prediction(Stock stock, PredictionRun predictionRun, BigDecimal predictionPrice, LocalDate targetDate,
                      String predictionSource, Integer predictionPeriod, LocalDate baseDate, LocalDateTime baseDatetime,
                      BigDecimal basePrice, BigDecimal predictedReturnRate, String predictedDirection,
                      String modelName, String modelVersion) {
        this.stock = stock;
        this.predictionRun = predictionRun;
        this.predictionPrice = predictionPrice;
        this.targetDate = targetDate;
        this.predictionSource = predictionSource;
        this.predictionPeriod = predictionPeriod;
        this.baseDate = baseDate;
        this.baseDatetime = baseDatetime;
        this.basePrice = basePrice;
        this.predictedReturnRate = predictedReturnRate;
        this.predictedDirection = predictedDirection;
        this.modelName = modelName;
        this.modelVersion = modelVersion;
        this.evaluationStatus = "WAITING";
    }

    public void updateEvaluationStatus(String evaluationStatus) {
        this.evaluationStatus = evaluationStatus;
    }
}
