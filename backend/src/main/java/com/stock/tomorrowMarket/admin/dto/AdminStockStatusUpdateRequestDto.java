package com.stock.tomorrowMarket.admin.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class AdminStockStatusUpdateRequestDto {
    @NotNull(message = "isActive cannot be null")
    @JsonProperty("isActive")
    private Boolean isActive;
}
