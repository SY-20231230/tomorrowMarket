package com.stock.tomorrowMarket.article.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class SentimentStatisticsResponse {

    private PieChartData pieChart;
    private List<TrendData> trendData;
    private List<String> relatedKeywords;

    @Getter
    @Builder
    public static class PieChartData {
        private int positive;
        private int neutral;
        private int negative;
    }

    @Getter
    @Builder
    public static class TrendData {
        private LocalDate date;
        private BigDecimal averageScore;
    }
}
