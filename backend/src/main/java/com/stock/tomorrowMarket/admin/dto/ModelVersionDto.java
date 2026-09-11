package com.stock.tomorrowMarket.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ModelVersionDto {
    private String modelName;
    private String modelVersion;
}
