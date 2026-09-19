package com.stock.tomorrowMarket.batch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrawlingDoneWebhookRequestDto {
    private String status;
    private String timestamp;
    private List<Long> newArticleIds;
    private String message;
}
