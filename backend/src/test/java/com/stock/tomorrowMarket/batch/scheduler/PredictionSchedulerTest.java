package com.stock.tomorrowMarket.batch.scheduler;

import com.stock.tomorrowMarket.batch.dto.BatchExecutionRequestDto;
import com.stock.tomorrowMarket.batch.service.BatchService;
import com.stock.tomorrowMarket.batch.service.TradingCalendarService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PredictionSchedulerTest {

    @Mock
    private BatchService batchService;

    @Mock
    private TradingCalendarService tradingCalendarService;

    @InjectMocks
    private PredictionScheduler predictionScheduler;

    @Test
    @DisplayName("이번 주의 첫 번째 영업일인 경우 WEEKLY_SHORT 배치가 실행된다")
    void runScheduledPredictions_CallsWeeklyShort_OnFirstTradingDayOfWeek() {
        // given
        when(tradingCalendarService.isFirstTradingDayOfWeek(any(LocalDate.class))).thenReturn(true);
        when(tradingCalendarService.isFirstTradingDayOfMonth(any(LocalDate.class))).thenReturn(false);

        // when
        predictionScheduler.runScheduledPredictions();

        // then
        verify(batchService, times(1)).executeBatch(argThat(req -> "WEEKLY_SHORT".equals(req.getRunType())));
        verify(batchService, never()).executeBatch(argThat(req -> "MONTHLY_LONG".equals(req.getRunType())));
    }

    @Test
    @DisplayName("이번 달의 첫 번째 영업일인 경우 MONTHLY_LONG 배치가 실행된다")
    void runScheduledPredictions_CallsMonthlyLong_OnFirstTradingDayOfMonth() {
        // given
        when(tradingCalendarService.isFirstTradingDayOfWeek(any(LocalDate.class))).thenReturn(false);
        when(tradingCalendarService.isFirstTradingDayOfMonth(any(LocalDate.class))).thenReturn(true);

        // when
        predictionScheduler.runScheduledPredictions();

        // then
        verify(batchService, times(1)).executeBatch(argThat(req -> "MONTHLY_LONG".equals(req.getRunType())));
        verify(batchService, never()).executeBatch(argThat(req -> "WEEKLY_SHORT".equals(req.getRunType())));
    }
    
    @Test
    @DisplayName("첫 영업일이 둘 다 아닌 경우 아무 배치도 실행되지 않는다")
    void runScheduledPredictions_DoesNotCallBatchService_WhenNotFirstDay() {
        // given
        when(tradingCalendarService.isFirstTradingDayOfWeek(any(LocalDate.class))).thenReturn(false);
        when(tradingCalendarService.isFirstTradingDayOfMonth(any(LocalDate.class))).thenReturn(false);

        // when
        predictionScheduler.runScheduledPredictions();

        // then
        verify(batchService, never()).executeBatch(any(BatchExecutionRequestDto.class));
    }
}
