package com.stock.tomorrowMarket.prediction.repository;

import com.stock.tomorrowMarket.prediction.entity.PredictionFailure;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PredictionFailureRepository extends JpaRepository<PredictionFailure, Long> {

    // IDX_PREDICTION_FAILURES_RUN_TIME (PREDICTION_RUN_ID, CREATED_AT DESC)
    Page<PredictionFailure> findByPredictionRun_PredictionRunIdOrderByCreatedAtDesc(Long predictionRunId, Pageable pageable);

    // IDX_PREDICTION_FAILURES_RETRY_STATUS (RETRY_STATUS, CREATED_AT DESC, PREDICTION_RUN_ID)
    Page<PredictionFailure> findByRetryStatusOrderByCreatedAtDesc(String retryStatus, Pageable pageable);

    // IDX_PREDICTION_FAILURES_STOCK_TIME (STOCK_ID, CREATED_AT DESC)
    Page<PredictionFailure> findByStock_StockIdOrderByCreatedAtDesc(Long stockId, Pageable pageable);
}
