package com.stock.tomorrowMarket.prediction.repository;

import com.stock.tomorrowMarket.prediction.entity.Prediction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, Long> {

    // IDX_PREDICTIONS_STOCK_SOURCE_BASE_DATE (STOCK_ID, PREDICTION_SOURCE, BASE_DATE DESC, PREDICTION_PERIOD)
    List<Prediction> findByStock_StockIdAndPredictionSourceOrderByBaseDateDesc(Long stockId, String predictionSource);

    Page<Prediction> findByStock_StockIdAndPredictionSourceOrderByBaseDateDesc(Long stockId, String predictionSource, Pageable pageable);

    // IDX_PREDICTIONS_EVALUATION_TARGET (EVALUATION_STATUS, TARGET_DATE, PREDICTION_ID)
    List<Prediction> findByEvaluationStatusAndTargetDateLessThanEqual(String evaluationStatus, LocalDate targetDate);

    // IDX_PREDICTIONS_ON_DEMAND_CACHE (STOCK_ID, PREDICTION_SOURCE, BASE_DATETIME DESC)
    List<Prediction> findByStock_StockIdAndPredictionSourceOrderByBaseDatetimeDesc(Long stockId, String predictionSource);

    // IDX_PREDICTIONS_MODEL_PERIOD (MODEL_VERSION, PREDICTION_PERIOD, PREDICTION_SOURCE, TARGET_DATE)
    Page<Prediction> findByModelVersionAndPredictionPeriodAndPredictionSourceAndTargetDateBetween(
            String modelVersion, Integer predictionPeriod, String predictionSource, LocalDate startDate, LocalDate endDate, Pageable pageable);
}
