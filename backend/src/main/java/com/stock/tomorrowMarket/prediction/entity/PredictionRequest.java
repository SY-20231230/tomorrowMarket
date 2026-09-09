package com.stock.tomorrowMarket.prediction.entity;

import com.stock.tomorrowMarket.stock.entity.Stock;
import com.stock.tomorrowMarket.user.entity.Users;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "PREDICTION_REQUESTS")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PredictionRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PREDICTION_REQUEST_ID")
    private Long predictionRequestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USERS_ID", nullable = false)
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STOCK_ID", nullable = false)
    private Stock stock;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PREDICTION_RUN_ID")
    private PredictionRun predictionRun; // 다른 개발자가 담당하는 도메인일 수 있어 ID 매핑만 우선 적용했었으나 PredictionRun 추가로 연관관계 매핑 완료

    @Enumerated(EnumType.STRING)
    @Column(name = "REQUEST_STATUS", nullable = false)
    private RequestStatus requestStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "RESULT_SOURCE")
    private ResultSource resultSource;

    @Column(name = "REQUESTED_AT", nullable = false, updatable = false)
    private LocalDateTime requestedAt;

    @Column(name = "COMPLETED_AT")
    private LocalDateTime completedAt;

    @Column(name = "FAILURE_REASON", columnDefinition = "TEXT")
    private String failureReason;

    @PrePersist
    protected void onCreate() {
        this.requestedAt = LocalDateTime.now();
    }

    @Builder
    public PredictionRequest(Users user, Stock stock, RequestStatus requestStatus) {
        this.user = user;
        this.stock = stock;
        this.requestStatus = requestStatus;
    }

    public void updateStatus(RequestStatus requestStatus, ResultSource resultSource, PredictionRun predictionRun) {
        this.requestStatus = requestStatus;
        this.resultSource = resultSource;
        this.predictionRun = predictionRun;
        if (requestStatus == RequestStatus.COMPLETED) {
            this.completedAt = LocalDateTime.now();
        }
    }

    public void markAsFailed(String failureReason) {
        this.requestStatus = RequestStatus.FAILED;
        this.failureReason = failureReason;
        this.completedAt = LocalDateTime.now();
    }
}
