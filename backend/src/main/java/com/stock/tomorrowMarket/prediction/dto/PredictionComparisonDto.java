package com.stock.tomorrowMarket.prediction.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PredictionComparisonDto {
    // G-001: 예측 기본 정보 및 평가 결과
    private PredictionResponseDto prediction;
    private PredictionEvaluationDto evaluation;

    // G-002: 실제 주가 차트 (과거 30일 등)
    private List<ChartDataDto> actualChart;

    // G-003: 예측 차트 데이터 (점선 처리용 기준가~목표가)
    private List<ChartDataDto> predictedChart;
}
