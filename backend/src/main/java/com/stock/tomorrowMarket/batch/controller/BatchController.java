package com.stock.tomorrowMarket.batch.controller;

import com.stock.tomorrowMarket.batch.dto.BatchDetailResponseDto;
import com.stock.tomorrowMarket.batch.dto.BatchResponseDto;
import com.stock.tomorrowMarket.batch.service.BatchService;
import com.stock.tomorrowMarket.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/batch")
@RequiredArgsConstructor
public class BatchController {

    private final BatchService batchService;

    // I-001: 정기 배치 실행 목록 전체 조회
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/runs")
    public ApiResponse<Page<BatchResponseDto>> getBatchRuns(Pageable pageable) {
        return ApiResponse.success(batchService.getBatchRuns(pageable));
    }

    // I-002: 단일 배치 실행 상세 조회 (실패 내역 포함)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/runs/{runId}")
    public ApiResponse<BatchDetailResponseDto> getBatchRunDetail(
            @PathVariable("runId") Long runId,
            Pageable failurePageable) {
        return ApiResponse.success(batchService.getBatchRunDetail(runId, failurePageable));
    }
}
