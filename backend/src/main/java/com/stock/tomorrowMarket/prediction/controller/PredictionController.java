package com.stock.tomorrowMarket.prediction.controller;

import com.stock.tomorrowMarket.global.response.ApiResponse;
import com.stock.tomorrowMarket.prediction.dto.PredictionResponseDto;
import com.stock.tomorrowMarket.prediction.service.PredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
public class PredictionController {

    private final PredictionService predictionService;

    // F-001: 종목별 최신 정기 예측 조회
    @GetMapping("/stocks/{stockId}/latest")
    public ApiResponse<PredictionResponseDto> getLatestPredictionByStock(
            @PathVariable("stockId") Long stockId,
            @RequestParam(value = "source", defaultValue = "SCHEDULED_WEEKLY") String predictionSource) {
        PredictionResponseDto response = predictionService.getLatestPredictionByStock(stockId, predictionSource);
        return ApiResponse.success(response);
    }

    // F-002: 산업군별 최신 정기 예측 조회
    @GetMapping("/sectors/{sectorId}/latest")
    public ApiResponse<List<PredictionResponseDto>> getLatestPredictionsBySector(
            @PathVariable("sectorId") Long sectorId,
            @RequestParam(value = "source", defaultValue = "SCHEDULED_WEEKLY") String predictionSource) {
        List<PredictionResponseDto> responses = predictionService.getLatestPredictionsBySector(sectorId, predictionSource);
        return ApiResponse.success(responses);
    }

    // F-003: 특정 종목의 정기 예측 과거 이력 조회
    @GetMapping("/stocks/{stockId}/history")
    public ApiResponse<Page<PredictionResponseDto>> getPredictionHistoryByStock(
            @PathVariable("stockId") Long stockId,
            @RequestParam(value = "source", defaultValue = "SCHEDULED_WEEKLY") String predictionSource,
            Pageable pageable) {
        Page<PredictionResponseDto> response = predictionService.getPredictionHistoryByStock(stockId, predictionSource, pageable);
        return ApiResponse.success(response);
    }
}
