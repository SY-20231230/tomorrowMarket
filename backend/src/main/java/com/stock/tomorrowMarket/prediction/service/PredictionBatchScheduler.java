package com.stock.tomorrowMarket.prediction.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PredictionBatchScheduler {

    private final PredictionBatchService predictionBatchService;

    /**
     * 매주 월요일 새벽 2시에 단기(SHORT) 및 중장기(LONG) 예측을 모두 수행하는 스케줄러.
     * (cron = "초 분 시 일 월 요일")
     */
    @Scheduled(cron = "0 0 2 * * MON")
    public void scheduleWeeklyPredictionBatch() {
        log.info("[SCHEDULED TRIGGER] Weekly AI Prediction Batch Triggered at 2 AM on Monday.");
        // "ALL" 타입을 주어 단기/장기 모두 예측하도록 지시
        predictionBatchService.runScheduledBatch("ALL");
    }
}
