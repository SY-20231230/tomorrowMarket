package com.stock.tomorrowMarket.watchlist.controller;

import com.stock.tomorrowMarket.watchlist.dto.WatchlistResponse;
import com.stock.tomorrowMarket.watchlist.service.WatchlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/watchlist")
@RequiredArgsConstructor
@Tag(name = "Watchlist", description = "관심 주식(종목) 관리 API")
public class WatchlistController {

    private final WatchlistService watchlistService;

    @Operation(summary = "관심 주식 목록 조회", description = "사용자가 등록한 관심 주식(종목) 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<List<WatchlistResponse>> getWatchlist(
            @RequestParam(defaultValue = "1") Long userId // 임시 모킹 유저 아이디
    ) {
        List<WatchlistResponse> response = watchlistService.getUserWatchlist(userId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "관심 주식 등록", description = "특정 주식을 관심 종목으로 등록합니다.")
    @PostMapping("/{stockId}")
    public ResponseEntity<Void> addStockToWatchlist(
            @PathVariable Long stockId,
            @RequestParam(defaultValue = "1") Long userId // 임시 모킹 유저 아이디
    ) {
        watchlistService.addStockToWatchlist(userId, stockId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "관심 주식 해제", description = "등록된 관심 주식을 관심 종목에서 해제합니다.")
    @DeleteMapping("/{stockId}")
    public ResponseEntity<Void> removeStockFromWatchlist(
            @PathVariable Long stockId,
            @RequestParam(defaultValue = "1") Long userId // 임시 모킹 유저 아이디
    ) {
        watchlistService.removeStockFromWatchlist(userId, stockId);
        return ResponseEntity.ok().build();
    }
}
