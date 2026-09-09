package com.stock.tomorrowMarket.prediction.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "PREDICTION_EVALUATIONS")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PredictionEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PREDICTION_EVALUATION_ID")
    private Long predictionEvaluationId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PREDICTION_ID", nullable = false, unique = true)
    private Prediction prediction;

    @Column(name = "ACTUAL_PRICE", nullable = false, precision = 15, scale = 2)
    private BigDecimal actualPrice;

    @Column(name = "PRICE_DIFFERENCE", nullable = false, precision = 15, scale = 2)
    private BigDecimal priceDifference;

    @Column(name = "ABSOLUTE_ERROR", nullable = false, precision = 15, scale = 2)
    private BigDecimal absoluteError;

    @Column(name = "ERROR_RATE", nullable = false, precision = 10, scale = 4)
    private BigDecimal errorRate;

    @Column(name = "ACTUAL_RETURN_RATE", precision = 10, scale = 4)
    private BigDecimal actualReturnRate;

    @Column(name = "ACTUAL_DIRECTION", length = 100)
    private String actualDirection; // UP, DOWN, FLAT

    @Column(name = "DIRECTION_CORRECT")
    private Boolean directionCorrect;

    @Column(name = "EVALUATED_AT", nullable = false, updatable = false)
    private LocalDateTime evaluatedAt;

    @PrePersist
    protected void onCreate() {
        this.evaluatedAt = LocalDateTime.now();
    }

    @Builder
    public PredictionEvaluation(Prediction prediction, BigDecimal actualPrice, BigDecimal priceDifference,
                                BigDecimal absoluteError, BigDecimal errorRate, BigDecimal actualReturnRate,
                                String actualDirection, Boolean directionCorrect) {
        this.prediction = prediction;
        this.actualPrice = actualPrice;
        this.priceDifference = priceDifference;
        this.absoluteError = absoluteError;
        this.errorRate = errorRate;
        this.actualReturnRate = actualReturnRate;
        this.actualDirection = actualDirection;
        this.directionCorrect = directionCorrect;
    }
}
