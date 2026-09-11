package com.stock.tomorrowMarket.admin.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DashboardDto {
    private long totalActiveUsers;
    private long totalPredictions;
    private long todayAccessCount;
}
