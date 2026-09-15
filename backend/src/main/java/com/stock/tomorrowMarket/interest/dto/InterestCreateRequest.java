package com.stock.tomorrowMarket.interest.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record InterestCreateRequest(
        @Schema(description = "관심 산업군 ID", example = "1")
        @NotNull(message = "산업군 ID는 필수입니다.")
        Long sectorId,

        @Schema(description = "관심도 레벨 (1~5)", example = "3")
        @Min(value = 1, message = "관심도 레벨은 1 이상이어야 합니다.")
        @Max(value = 5, message = "관심도 레벨은 5 이하여야 합니다.")
        Byte level
) {}
