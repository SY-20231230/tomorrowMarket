package com.stock.tomorrowMarket.prediction.service;

import com.stock.tomorrowMarket.global.exception.CustomException;
import com.stock.tomorrowMarket.global.exception.ErrorCode;
import com.stock.tomorrowMarket.prediction.dto.ChartDataDto;
import com.stock.tomorrowMarket.prediction.dto.PredictionComparisonDto;
import com.stock.tomorrowMarket.prediction.dto.PredictionEvaluationDto;
import com.stock.tomorrowMarket.prediction.dto.PredictionResponseDto;
import com.stock.tomorrowMarket.prediction.entity.Prediction;
import com.stock.tomorrowMarket.prediction.entity.PredictionEvaluation;
import com.stock.tomorrowMarket.prediction.repository.PredictionEvaluationRepository;
import com.stock.tomorrowMarket.prediction.repository.PredictionRepository;
import com.stock.tomorrowMarket.stock.entity.StockHistory;
import com.stock.tomorrowMarket.stock.repository.StockHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PredictionComparisonService {

    private final PredictionRepository predictionRepository;
    private final PredictionEvaluationRepository evaluationRepository;
    private final StockHistoryRepository stockHistoryRepository;

    @Transactional(readOnly = true)
    public PredictionComparisonDto getPredictionComparison(Long predictionId) {
        // G-001: 예측 기본 정보
        Prediction prediction = predictionRepository.findById(predictionId)
                .orElseThrow(() -> new CustomException(ErrorCode.PREDICTION_NOT_FOUND));
        
        PredictionEvaluation evaluation = evaluationRepository.findByPrediction_PredictionId(predictionId).orElse(null);

        // G-002: 실제 주가 차트 (예측 기준일 이전 30일 ~ 예측 대상일까지)
        LocalDate startDate = prediction.getBaseDate().minusDays(30);
        LocalDate endDate = prediction.getTargetDate();
        if (LocalDate.now().isBefore(endDate)) {
            endDate = LocalDate.now(); // 아직 타겟 날짜 안 왔으면 오늘까지만
        }

        List<StockHistory> histories = stockHistoryRepository.findByStockAndHistoryDateBetweenOrderByHistoryDateAsc(
                prediction.getStock(), startDate, endDate);

        List<ChartDataDto> actualChart = histories.stream()
                .map(h -> new ChartDataDto(h.getHistoryDate(), h.getClosingPrice()))
                .collect(Collectors.toList());

        // G-003: 예측 차트 데이터 (점선 처리용 기준일~목표일 연결선)
        List<ChartDataDto> predictedChart = new ArrayList<>();
        predictedChart.add(new ChartDataDto(prediction.getBaseDate(), prediction.getBasePrice()));
        predictedChart.add(new ChartDataDto(prediction.getTargetDate(), prediction.getPredictionPrice()));

        return PredictionComparisonDto.builder()
                .prediction(PredictionResponseDto.from(prediction))
                .evaluation(PredictionEvaluationDto.from(evaluation))
                .actualChart(actualChart)
                .predictedChart(predictedChart)
                .build();
    }
}
