package com.stock.tomorrowMarket.prediction.controller;

import com.stock.tomorrowMarket.global.response.ApiResponse;
import com.stock.tomorrowMarket.global.security.CustomUserDetails;
import com.stock.tomorrowMarket.prediction.dto.PredictionRequestResponseDto;
import com.stock.tomorrowMarket.prediction.dto.PredictionResponseDto;
import com.stock.tomorrowMarket.prediction.service.PredictionRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
public class PredictionRequestController {

    private final PredictionRequestService requestService;

    // F-004: 사용자 재분석(On-demand) 요청
    @PostMapping("/stocks/{stockId}/reanalysis")
    public ApiResponse<PredictionRequestResponseDto> requestReanalysis(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("stockId") Long stockId) {
        PredictionRequestResponseDto response = requestService.requestReanalysis(userDetails.getUsersId(), stockId);
        return ApiResponse.success(response);
    }

    // F-005: 재분석 진행 상태 조회
    @GetMapping("/requests/{requestId}/status")
    public ApiResponse<PredictionRequestResponseDto> getRequestStatus(
            @PathVariable("requestId") Long requestId) {
        PredictionRequestResponseDto response = requestService.getRequestStatus(requestId);
        return ApiResponse.success(response);
    }

    // F-006: 재분석 결과 반환
    @GetMapping("/stocks/{stockId}/reanalysis/result")
    public ApiResponse<PredictionResponseDto> getReanalysisResult(
            @PathVariable("stockId") Long stockId) {
        PredictionResponseDto response = requestService.getReanalysisResult(stockId);
        return ApiResponse.success(response);
    }
}
