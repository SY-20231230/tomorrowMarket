package com.stock.tomorrowMarket.prediction.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
@AllArgsConstructor
public class ChartDataDto {
    private LocalDate date;
    private BigDecimal price;
}
