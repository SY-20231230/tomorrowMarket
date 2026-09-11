package com.stock.tomorrowMarket.prediction.repository;

import com.stock.tomorrowMarket.prediction.entity.PredictionRun;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.time.LocalDate;

@Repository
public interface PredictionRunRepository extends JpaRepository<PredictionRun, Long> {

    // IDX_PREDICTION_RUNS_TYPE_DATE (RUN_TYPE, SCHEDULED_BASE_DATE DESC, PREDICTION_RUN_ID)
    Page<PredictionRun> findByRunTypeOrderByScheduledBaseDateDesc(String runType, Pageable pageable);

    // IDX_PREDICTION_RUNS_STATUS_CREATED (RUN_STATUS, CREATED_AT DESC, PREDICTION_RUN_ID)
    Page<PredictionRun> findByRunStatusOrderByCreatedAtDesc(String runStatus, Pageable pageable);

    @Query("SELECT DISTINCT p.modelName, p.modelVersion FROM PredictionRun p WHERE p.modelName IS NOT NULL")
    List<Object[]> findDistinctModels();

    // I-001: 전체 배치 실행 내역 페이징 조회 (최신순)
    Page<PredictionRun> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
