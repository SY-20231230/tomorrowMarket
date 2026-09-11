package com.stock.tomorrowMarket.batch.service;

import com.stock.tomorrowMarket.batch.dto.BatchExecutionRequestDto;
import com.stock.tomorrowMarket.batch.dto.BatchDetailResponseDto;
import com.stock.tomorrowMarket.batch.dto.BatchFailureResponseDto;
import com.stock.tomorrowMarket.batch.dto.BatchResponseDto;
import com.stock.tomorrowMarket.global.exception.CustomException;
import com.stock.tomorrowMarket.global.exception.ErrorCode;
import com.stock.tomorrowMarket.prediction.client.AiPredictionClient;
import com.stock.tomorrowMarket.prediction.entity.Prediction;
import com.stock.tomorrowMarket.prediction.entity.PredictionFailure;
import com.stock.tomorrowMarket.prediction.entity.PredictionRun;
import com.stock.tomorrowMarket.prediction.repository.PredictionFailureRepository;
import com.stock.tomorrowMarket.prediction.repository.PredictionRepository;
import com.stock.tomorrowMarket.prediction.repository.PredictionRunRepository;
import com.stock.tomorrowMarket.stock.entity.Stock;
import com.stock.tomorrowMarket.stock.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BatchService {

    private final PredictionRunRepository predictionRunRepository;
    private final PredictionFailureRepository predictionFailureRepository;
    private final StockRepository stockRepository;
    private final AiPredictionClient aiPredictionClient;
    private final PredictionRepository predictionRepository;

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

    // I-003, I-004: 수동 배치 실행 (특정 종목 또는 전체)
    @Transactional
    public BatchResponseDto executeBatch(BatchExecutionRequestDto requestDto) {
        List<Stock> targets;
        if (requestDto.getStockIds() != null && !requestDto.getStockIds().isEmpty()) {
            targets = stockRepository.findAllById(requestDto.getStockIds());
        } else {
            targets = stockRepository.findByIsActiveTrue();
        }

        PredictionRun run = PredictionRun.builder()
                .runType(requestDto.getRunType())
                .scheduledBaseDate(requestDto.getScheduledBaseDate())
                .dataCutoffDatetime(LocalDateTime.now())
                .modelName("LightGBM-Mock")
                .modelVersion("v1.0")
                .totalStockCount(targets.size())
                .expectedResultCount(targets.size() * 1) // 1 period mock
                .build();

        predictionRunRepository.save(run);
        run.startRun();

        int successCount = 0;
        int failureCount = 0;

        for (Stock stock : targets) {
            try {
                Prediction prediction = aiPredictionClient.requestPrediction(stock, requestDto.getRunType(), run);
                predictionRepository.save(prediction);
                successCount++;
            } catch (Exception e) {
                failureCount++;
                PredictionFailure failure = PredictionFailure.builder()
                        .predictionRun(run)
                        .stock(stock)
                        .predictionPeriod(1)
                        .failureStage("AI_CLIENT_CALL")
                        .errorMessage(e.getMessage() != null ? e.getMessage() : "Unknown Error")
                        .build();
                predictionFailureRepository.save(failure);
            }
        }

        String finalStatus = failureCount == 0 ? "SUCCESS" : (successCount > 0 ? "PARTIAL_SUCCESS" : "FAILED");
        run.finishRun(finalStatus, successCount, failureCount, failureCount > 0 ? "Some predictions failed." : null);

        return BatchResponseDto.from(run);
    }
}
