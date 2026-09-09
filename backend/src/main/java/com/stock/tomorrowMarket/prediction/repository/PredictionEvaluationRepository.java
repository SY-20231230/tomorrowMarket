package com.stock.tomorrowMarket.prediction.repository;

import com.stock.tomorrowMarket.prediction.entity.PredictionEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PredictionEvaluationRepository extends JpaRepository<PredictionEvaluation, Long> {

    Optional<PredictionEvaluation> findByPrediction_PredictionId(Long predictionId);
}
