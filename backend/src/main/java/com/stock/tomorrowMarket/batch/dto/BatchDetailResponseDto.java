package com.stock.tomorrowMarket.batch.dto;

import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

@Getter
@Builder
public class BatchDetailResponseDto {
    private BatchResponseDto batchRun;
    private Page<BatchFailureResponseDto> failures;
}
