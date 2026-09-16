package com.stock.tomorrowMarket.batch.scheduler;

import com.stock.tomorrowMarket.batch.dto.BatchExecutionRequestDto;
import com.stock.tomorrowMarket.batch.service.BatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class PredictionScheduler {

    private final BatchService batchService;
    private final com.stock.tomorrowMarket.batch.service.TradingCalendarService tradingCalendarService;

    // Run every day at 18:00 (after market closes and sentiment data is collected)
    // 0 0 18 * * ? (cron format)
    @Scheduled(cron = "0 0 18 * * ?")
    public void runDailyPredictions() {
        LocalDate today = LocalDate.now();
        if (!tradingCalendarService.isTradingDay(today)) {
            log.info("Today ({}) is not a trading day. Skipping daily batch predictions.", today);
            return;
        }

        log.info("Starting Daily Batch Predictions Scheduler");
        try {
            BatchExecutionRequestDto request = BatchExecutionRequestDto.builder()
                    .runType("ALL") // Request both SHORT and LONG
                    .scheduledBaseDate(LocalDate.now())
                    // no stockIds -> runs for all active stocks
                    .build();

            batchService.executeBatch(request);
            log.info("Daily Batch Predictions Scheduler completed successfully.");
        } catch (Exception e) {
            log.error("Failed to run Daily Batch Predictions: ", e);
        }
    }
}
