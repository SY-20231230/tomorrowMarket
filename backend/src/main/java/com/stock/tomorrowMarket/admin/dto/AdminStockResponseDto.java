package com.stock.tomorrowMarket.admin.dto;

import com.stock.tomorrowMarket.stock.entity.Stock;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminStockResponseDto {
    private Long stockId;
    private String stockCode;
    private String name;
    private String marketType;
    private boolean isActive;

    public static AdminStockResponseDto from(Stock stock) {
        return AdminStockResponseDto.builder()
                .stockId(stock.getStockId())
                .stockCode(stock.getStockCode())
                .name(stock.getName())
                .marketType(stock.getMarketType().name())
                .isActive(stock.isActive())
                .build();
    }
}
