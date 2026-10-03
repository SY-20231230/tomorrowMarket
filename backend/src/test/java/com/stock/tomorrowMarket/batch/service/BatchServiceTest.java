package com.stock.tomorrowMarket.batch.service;

import com.stock.tomorrowMarket.batch.dto.BatchExecutionRequestDto;
import com.stock.tomorrowMarket.batch.dto.BatchResponseDto;
import com.stock.tomorrowMarket.batch.dto.CrawlingDoneWebhookRequestDto;
import com.stock.tomorrowMarket.prediction.client.AiPredictionClient;
import com.stock.tomorrowMarket.prediction.entity.Prediction;
import com.stock.tomorrowMarket.prediction.entity.PredictionFailure;
import com.stock.tomorrowMarket.prediction.entity.PredictionRun;
import com.stock.tomorrowMarket.prediction.repository.PredictionFailureRepository;
import com.stock.tomorrowMarket.prediction.repository.PredictionRepository;
import com.stock.tomorrowMarket.prediction.repository.PredictionRunRepository;
import com.stock.tomorrowMarket.stock.entity.Stock;
import com.stock.tomorrowMarket.stock.repository.StockRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BatchServiceTest {

    @Mock
    private PredictionRunRepository predictionRunRepository;
    @Mock
    private PredictionFailureRepository predictionFailureRepository;
    @Mock
    private StockRepository stockRepository;
    @Mock
    private AiPredictionClient aiPredictionClient;
    @Mock
    private PredictionRepository predictionRepository;

    @InjectMocks
    private BatchService batchService;

    @Test
    @DisplayName("수동 배치 실행 시 AI 클라이언트를 호출하고 결과를 저장한다")
    void executeBatch_Success() {
        // given
        BatchExecutionRequestDto requestDto = BatchExecutionRequestDto.builder()
                .runType("ALL")
                .scheduledBaseDate(LocalDate.now())
                .build();

        Stock mockStock = Stock.builder().stockCode("005930").name("삼성전자").build();
        when(stockRepository.findByIsActiveTrue()).thenReturn(List.of(mockStock));

        Prediction mockPrediction = Prediction.builder().build();
        when(aiPredictionClient.requestBatchPredictions(anyList(), anyString(), any(PredictionRun.class)))
                .thenReturn(List.of(mockPrediction));

        // when
        BatchResponseDto response = batchService.executeBatch(requestDto);

        // then
        assertThat(response.getRunStatus()).isEqualTo("SUCCESS");
        verify(predictionRunRepository, times(1)).save(any(PredictionRun.class));
        verify(aiPredictionClient, times(1)).requestBatchPredictions(anyList(), eq("ALL"), any(PredictionRun.class));
        verify(predictionRepository, times(1)).saveAll(anyList());
    }

    @Test
    @DisplayName("배치 실행 중 AI 서버 통신 에러 시 PredictionFailure를 저장한다")
    void executeBatch_Failure_SavesPredictionFailure() {
        // given
        BatchExecutionRequestDto requestDto = BatchExecutionRequestDto.builder()
                .runType("ALL")
                .scheduledBaseDate(LocalDate.now())
                .build();

        Stock mockStock = Stock.builder().stockCode("005930").name("삼성전자").build();
        when(stockRepository.findByIsActiveTrue()).thenReturn(List.of(mockStock));

        when(aiPredictionClient.requestBatchPredictions(anyList(), anyString(), any(PredictionRun.class)))
                .thenThrow(new RuntimeException("Connection Refused"));

        // when
        BatchResponseDto response = batchService.executeBatch(requestDto);

        // then
        assertThat(response.getRunStatus()).isEqualTo("FAILED");
        verify(predictionFailureRepository, times(1)).save(any(PredictionFailure.class));
        verify(predictionRepository, never()).saveAll(anyList());
    }

    @Test
    @DisplayName("크롤링 완료 웹훅 수신 시 비동기로 감성 분석을 요청한다")
    void handleCrawlingDoneWebhook_CallsSentimentAnalysis() {
        // given
        CrawlingDoneWebhookRequestDto requestDto = CrawlingDoneWebhookRequestDto.builder()
                .status("SUCCESS")
                .newArticleIds(List.of(101L, 102L))
                .build();

        // when
        batchService.handleCrawlingDoneWebhook(requestDto);

        // then
        // CompletableFuture.runAsync 딜레이로 인해 즉시 verify가 안 될 수 있으므로 timeout 사용
        verify(aiPredictionClient, timeout(500).times(1)).requestSentimentAnalysis(requestDto.getNewArticleIds());
    }
}
