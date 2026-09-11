package com.stock.tomorrowMarket.admin.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class AdminStockStatusUpdateRequestDto {
    @NotNull(message = "isActive cannot be null")
    private Boolean isActive;
}
