package com.stock.tomorrowMarket.interest.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record InterestUpdateRequest(
        @Schema(description = "변경할 관심도 레벨 (1~5)", example = "5")
        @NotNull(message = "관심도 레벨은 필수입니다.")
        @Min(value = 1, message = "관심도 레벨은 1 이상이어야 합니다.")
        @Max(value = 5, message = "관심도 레벨은 5 이하여야 합니다.")
        Byte level
) {}
