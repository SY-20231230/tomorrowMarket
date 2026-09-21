package com.stock.tomorrowMarket.prediction.service;

import com.stock.tomorrowMarket.prediction.client.AiPredictionClient;
import com.stock.tomorrowMarket.prediction.entity.Prediction;
import com.stock.tomorrowMarket.prediction.entity.PredictionRun;
import com.stock.tomorrowMarket.prediction.repository.PredictionRepository;
import com.stock.tomorrowMarket.prediction.repository.PredictionRunRepository;
import com.stock.tomorrowMarket.stock.entity.Stock;
import com.stock.tomorrowMarket.stock.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PredictionBatchService {

    private final StockRepository stockRepository;
    private final PredictionRunRepository predictionRunRepository;
    private final AiPredictionClient aiPredictionClient;
    private final PredictionRepository predictionRepository;

    @Transactional
    public void runScheduledBatch(String runType) {
        log.info("[BATCH START] AI Prediction Batch Started. Type: {}", runType);

        List<Stock> activeStocks = stockRepository.findAll();
        if (activeStocks.isEmpty()) {
            log.warn("[BATCH ABORT] No active stocks found.");
            return;
        }

        // 1. PredictionRun 생성 (DB 상태 기록 시작)
        PredictionRun predictionRun = PredictionRun.builder()
                .runType(runType)
                .scheduledBaseDate(LocalDate.now())
                .dataCutoffDatetime(LocalDateTime.now())
                .modelName("TFT-LightGBM Ensemble")
                .modelVersion("v1.0")
                .totalStockCount(activeStocks.size())
                .expectedResultCount(activeStocks.size() * ("ALL".equals(runType) ? 2 : 1))
                .build();
        
        predictionRun.startRun();
        predictionRunRepository.save(predictionRun); // PENDING -> RUNNING

        try {
            // 2. 파이썬 AI 서버로 배치 예측 요청
            log.info("[BATCH PROCESSING] Sending {} stocks to AI Server...", activeStocks.size());
            List<Prediction> predictions = aiPredictionClient.requestBatchPredictions(activeStocks, runType, predictionRun);

            if (predictions == null || predictions.isEmpty()) {
                log.warn("[BATCH WARNING] AI Server returned empty predictions.");
                predictionRun.finishRun("PARTIAL_SUCCESS", 0, activeStocks.size(), "AI 서버에서 반환된 예측값이 없습니다.");
            } else {
                // 3. 예측 결과 DB 저장
                predictionRepository.saveAll(predictions);
                log.info("[BATCH SUCCESS] Successfully saved {} predictions.", predictions.size());
                predictionRun.finishRun("SUCCESS", activeStocks.size(), 0, null);
            }
        } catch (Exception e) {
            // 4. 에러 발생 시 백엔드가 죽지 않도록 방어하고 FAILED 상태로 기록
            log.error("[BATCH ERROR] AI Prediction Batch Failed: {}", e.getMessage(), e);
            predictionRun.finishRun("FAILED", 0, activeStocks.size(), "AI 예측 서버 통신 실패 (가중치 미존재 등): " + e.getMessage());
        }

        predictionRunRepository.save(predictionRun);
        log.info("[BATCH FINISHED] AI Prediction Batch Finished with status: {}", predictionRun.getRunStatus());
    }
}
