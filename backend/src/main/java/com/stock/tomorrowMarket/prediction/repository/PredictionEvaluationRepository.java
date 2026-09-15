package com.stock.tomorrowMarket.prediction.repository;

import com.stock.tomorrowMarket.prediction.entity.PredictionEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PredictionEvaluationRepository extends JpaRepository<PredictionEvaluation, Long> {

    Optional<PredictionEvaluation> findByPrediction_PredictionId(Long predictionId);

    // G-007: 특정 종목의 예측 성능 종합 통계 산출
    @Query("SELECT COUNT(e), SUM(CASE WHEN e.directionCorrect = true THEN 1 ELSE 0 END), AVG(e.errorRate) " +
           "FROM PredictionEvaluation e WHERE e.prediction.stock.stockId = :stockId")
    Object[] getStockStats(@Param("stockId") Long stockId);
}
