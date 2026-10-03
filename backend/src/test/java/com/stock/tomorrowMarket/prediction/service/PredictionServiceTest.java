package com.stock.tomorrowMarket.prediction.service;

import com.stock.tomorrowMarket.global.exception.CustomException;
import com.stock.tomorrowMarket.prediction.dto.PredictionResponseDto;
import com.stock.tomorrowMarket.prediction.entity.Prediction;
import com.stock.tomorrowMarket.prediction.repository.PredictionRepository;
import com.stock.tomorrowMarket.stock.entity.Stock;
import com.stock.tomorrowMarket.stock.repository.StockRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PredictionServiceTest {

    @Mock
    private PredictionRepository predictionRepository;

    @Mock
    private StockRepository stockRepository;

    @InjectMocks
    private PredictionService predictionService;

    @Test
    @DisplayName("종목별 최신 정기 예측 조회 성공")
    void getLatestPredictionByStock_Success() {
        // given
        Stock stock = Stock.builder().stockCode("005930").name("삼성전자").build();
        Prediction prediction = Prediction.builder()
                .stock(stock)
                .predictionPrice(BigDecimal.valueOf(80000))
                .targetDate(LocalDate.now().plusDays(7))
                .predictionSource("SCHEDULED_WEEKLY")
                .predictedDirection("UP")
                .build();
        
        Page<Prediction> page = new PageImpl<>(List.of(prediction));
        when(predictionRepository.findByStock_StockIdAndPredictionSourceOrderByBaseDateDesc(
                eq(1L), eq("SCHEDULED_WEEKLY"), any(PageRequest.class)
        )).thenReturn(page);

        // when
        PredictionResponseDto response = predictionService.getLatestPredictionByStock(1L, "SCHEDULED_WEEKLY");

        // then
        assertThat(response).isNotNull();
        assertThat(response.getPredictedDirection()).isEqualTo("UP");
        assertThat(response.getPredictionPrice()).isEqualByComparingTo(BigDecimal.valueOf(80000));
    }

    @Test
    @DisplayName("종목별 최신 정기 예측 내역이 없을 경우 예외 발생")
    void getLatestPredictionByStock_NotFound_ThrowsException() {
        // given
        Page<Prediction> emptyPage = new PageImpl<>(Collections.emptyList());
        when(predictionRepository.findByStock_StockIdAndPredictionSourceOrderByBaseDateDesc(
                eq(1L), eq("SCHEDULED_WEEKLY"), any(PageRequest.class)
        )).thenReturn(emptyPage);

        // when & then
        assertThrows(CustomException.class, () -> 
                predictionService.getLatestPredictionByStock(1L, "SCHEDULED_WEEKLY")
        );
    }

    @Test
    @DisplayName("산업군별 최신 정기 예측 조회 성공")
    void getLatestPredictionsBySector_Success() {
        // given
        Stock stock1 = Stock.builder().stockCode("005930").name("삼성전자").build();
        // Since id is not in builder, we rely on Mockito matching or just ignoring ID in DTO if not mapped strictly.
        when(stockRepository.findBySector_SectorsId(10L)).thenReturn(List.of(stock1));

        Prediction prediction = Prediction.builder()
                .stock(stock1)
                .predictionPrice(BigDecimal.valueOf(80000))
                .targetDate(LocalDate.now().plusDays(7))
                .predictionSource("SCHEDULED_WEEKLY")
                .build();

        Page<Prediction> page = new PageImpl<>(List.of(prediction));
        when(predictionRepository.findByStock_StockIdAndPredictionSourceOrderByBaseDateDesc(
                any(), eq("SCHEDULED_WEEKLY"), any(PageRequest.class)
        )).thenReturn(page);

        // when
        List<PredictionResponseDto> responses = predictionService.getLatestPredictionsBySector(10L, "SCHEDULED_WEEKLY");

        // then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getPredictionPrice()).isEqualByComparingTo(BigDecimal.valueOf(80000));
    }

    @Test
    @DisplayName("특정 종목의 정기 예측 과거 이력 조회 성공")
    void getPredictionHistoryByStock_Success() {
        // given
        Stock stock = Stock.builder().stockCode("005930").name("삼성전자").build();
        Prediction prediction = Prediction.builder()
                .stock(stock)
                .predictionPrice(BigDecimal.valueOf(80000))
                .build();
        
        Page<Prediction> page = new PageImpl<>(List.of(prediction));
        when(predictionRepository.findByStock_StockIdAndPredictionSourceOrderByBaseDateDesc(
                eq(1L), eq("SCHEDULED_WEEKLY"), any(Pageable.class)
        )).thenReturn(page);

        // when
        Page<PredictionResponseDto> responses = predictionService.getPredictionHistoryByStock(1L, "SCHEDULED_WEEKLY", PageRequest.of(0, 10));

        // then
        assertThat(responses.getContent()).hasSize(1);
        assertThat(responses.getContent().get(0).getPredictionPrice()).isEqualByComparingTo(BigDecimal.valueOf(80000));
    }
}
