package com.stock.tomorrowMarket.batch.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
public class BatchExecutionRequestDto {
    @NotNull(message = "runType cannot be null")
    private String runType;
    
    @NotNull(message = "scheduledBaseDate cannot be null")
    private LocalDate scheduledBaseDate;
    
    private List<Long> stockIds;
}
