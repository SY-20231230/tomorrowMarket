package com.stock.tomorrowMarket.stock.controller;

import com.stock.tomorrowMarket.stock.dto.StockDetailResponse;
import com.stock.tomorrowMarket.stock.dto.StockHistoryResponse;
import com.stock.tomorrowMarket.stock.dto.StockResponse;
import com.stock.tomorrowMarket.stock.entity.MarketType;
import com.stock.tomorrowMarket.stock.service.StockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
@Tag(name = "Stock", description = "주식 정보 API")
public class StockController {

    private final StockService stockService;

    @Operation(summary = "주식 목록 조회", description = "주식 목록을 페이징, 검색, 필터링(시장, 산업)하여 조회합니다.")
    @GetMapping
    public ResponseEntity<Page<StockResponse>> getStocks(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long sectorId,
            @RequestParam(required = false) MarketType marketType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "name"));
        Page<StockResponse> response = stockService.getStocks(keyword, sectorId, marketType, pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "주식 상세 조회", description = "주식의 기본 정보와 최근 종가를 조회합니다.")
    @GetMapping("/{stockId}")
    public ResponseEntity<StockDetailResponse> getStockDetail(@PathVariable Long stockId) {
        StockDetailResponse response = stockService.getStockDetail(stockId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "주식 과거 데이터 조회 (차트용)", description = "주식의 지정된 기간 동안의 종가 및 등락률 데이터를 조회합니다.")
    @GetMapping("/{stockId}/history")
    public ResponseEntity<List<StockHistoryResponse>> getStockHistory(
            @PathVariable Long stockId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        List<StockHistoryResponse> response = stockService.getStockHistory(stockId, startDate, endDate);
        return ResponseEntity.ok(response);
    }
}
