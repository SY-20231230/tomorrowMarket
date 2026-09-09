package com.stock.tomorrowMarket.log.controller;

import com.stock.tomorrowMarket.global.response.ApiResponse;
import com.stock.tomorrowMarket.log.dto.AccessLogStatsDto;
import com.stock.tomorrowMarket.log.dto.SearchLogStatsDto;
import com.stock.tomorrowMarket.log.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    // J-001: 기간별 접속량 통계
    @GetMapping("/access-logs")
    public ApiResponse<AccessLogStatsDto> getAccessStatistics(
            @RequestParam("startTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam("endTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        AccessLogStatsDto response = statisticsService.getAccessStatistics(startTime, endTime);
        return ApiResponse.success(response);
    }

    // J-002: 최다 검색 종목 통계
    @GetMapping("/search-logs/top")
    public ApiResponse<List<SearchLogStatsDto>> getTopSearchedStocks(
            @RequestParam("startTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam("endTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @RequestParam(value = "limit", defaultValue = "10") int limit) {
        List<SearchLogStatsDto> response = statisticsService.getTopSearchedStocks(startTime, endTime, limit);
        return ApiResponse.success(response);
    }
}
