package com.stock.tomorrowMarket.batch.service;

import com.stock.tomorrowMarket.batch.dto.BatchDetailResponseDto;
import com.stock.tomorrowMarket.batch.dto.BatchFailureResponseDto;
import com.stock.tomorrowMarket.batch.dto.BatchResponseDto;
import com.stock.tomorrowMarket.global.exception.CustomException;
import com.stock.tomorrowMarket.global.exception.ErrorCode;
import com.stock.tomorrowMarket.prediction.entity.PredictionRun;
import com.stock.tomorrowMarket.prediction.repository.PredictionFailureRepository;
import com.stock.tomorrowMarket.prediction.repository.PredictionRunRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BatchService {

    private final PredictionRunRepository predictionRunRepository;
    private final PredictionFailureRepository predictionFailureRepository;

    // I-001: 정기 배치(Prediction Runs) 실행 목록 조회
    @Transactional(readOnly = true)
    public Page<BatchResponseDto> getBatchRuns(Pageable pageable) {
        return predictionRunRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(BatchResponseDto::from);
    }

    // I-002: 단일 배치 실행 상세 조회 (및 실패 내역)
    @Transactional(readOnly = true)
    public BatchDetailResponseDto getBatchRunDetail(Long runId, Pageable failurePageable) {
        PredictionRun run = predictionRunRepository.findById(runId)
                .orElseThrow(() -> new CustomException(ErrorCode.PREDICTION_RUN_NOT_FOUND));

        Page<BatchFailureResponseDto> failures = predictionFailureRepository
                .findByPredictionRun_PredictionRunIdOrderByCreatedAtDesc(runId, failurePageable)
                .map(BatchFailureResponseDto::from);

        return BatchDetailResponseDto.builder()
                .batchRun(BatchResponseDto.from(run))
                .failures(failures)
                .build();
    }
}
