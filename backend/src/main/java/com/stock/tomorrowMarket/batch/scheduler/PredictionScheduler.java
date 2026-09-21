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
    public void runScheduledPredictions() {
        LocalDate today = LocalDate.now();
        
        // 1. Check Weekly Short Prediction
        if (tradingCalendarService.isFirstTradingDayOfWeek(today)) {
            log.info("Today ({}) is the first trading day of the week. Starting WEEKLY_SHORT batch.", today);
            executePredictionBatch("WEEKLY_SHORT", today);
        }

        // 2. Check Monthly Long Prediction
        if (tradingCalendarService.isFirstTradingDayOfMonth(today)) {
            log.info("Today ({}) is the first trading day of the month. Starting MONTHLY_LONG batch.", today);
            executePredictionBatch("MONTHLY_LONG", today);
        }
        
        if (!tradingCalendarService.isFirstTradingDayOfWeek(today) && !tradingCalendarService.isFirstTradingDayOfMonth(today)) {
            log.info("Today ({}) is not the first trading day of the week or month. Skipping predictions.", today);
        }
    }

    private void executePredictionBatch(String runType, LocalDate baseDate) {
        try {
            BatchExecutionRequestDto request = BatchExecutionRequestDto.builder()
                    .runType(runType)
                    .scheduledBaseDate(baseDate)
                    .build();

            batchService.executeBatch(request);
            log.info("Batch Prediction ({}) completed successfully.", runType);
        } catch (Exception e) {
            log.error("Failed to run Batch Prediction ({}): ", runType, e);
        }
    }
}
