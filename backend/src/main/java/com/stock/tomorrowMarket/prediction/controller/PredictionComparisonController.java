package com.stock.tomorrowMarket.prediction.controller;

import com.stock.tomorrowMarket.global.response.ApiResponse;
import com.stock.tomorrowMarket.prediction.dto.PredictionComparisonDto;
import com.stock.tomorrowMarket.prediction.service.PredictionComparisonService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
public class PredictionComparisonController {

    private final PredictionComparisonService comparisonService;

    // G-001 ~ G-003: 특정 예측 건에 대한 기초 및 차트 데이터 제공 (예측vs실제 비교)
    @GetMapping("/{predictionId}/comparison")
    public ApiResponse<PredictionComparisonDto> getPredictionComparison(@PathVariable("predictionId") Long predictionId) {
        return ApiResponse.success(comparisonService.getPredictionComparison(predictionId));
    }
}
