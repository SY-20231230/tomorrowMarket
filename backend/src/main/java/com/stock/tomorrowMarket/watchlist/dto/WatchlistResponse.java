package com.stock.tomorrowMarket.watchlist.dto;

import com.stock.tomorrowMarket.watchlist.entity.Watchlist;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class WatchlistResponse {

    private Long watchlistId;
    private Long stockId;
    private String stockName;
    private String stockCode;
    private LocalDateTime createdAt;

    public static WatchlistResponse from(Watchlist watchlist) {
        return WatchlistResponse.builder()
                .watchlistId(watchlist.getWatchlistId())
                .stockId(watchlist.getStock().getStockId())
                .stockName(watchlist.getStock().getName())
                .stockCode(watchlist.getStock().getStockCode())
                .createdAt(watchlist.getCreatedAt())
                .build();
    }
}
