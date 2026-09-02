package com.stock.tomorrowMarket.article.controller;

import com.stock.tomorrowMarket.article.dto.ArticleResponse;
import com.stock.tomorrowMarket.article.service.ArticleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
@Tag(name = "Article", description = "뉴스 기사 API")
public class ArticleController {

    private final ArticleService articleService;

    @Operation(summary = "뉴스 기사 목록 조회", description = "조건(종목, 산업, 시장, 지표)에 따라 뉴스를 필터링하고 정렬하여 반환합니다.")
    @GetMapping
    public ResponseEntity<Page<ArticleResponse>> getArticles(
            @RequestParam(required = false) Long stockId,
            @RequestParam(required = false) Long sectorId,
            @RequestParam(required = false) String category, // "시장" or "지표"
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "4") int size,
            @RequestParam(defaultValue = "LATEST") String sort // LATEST, OLDEST, SENTIMENT_DESC, SENTIMENT_ASC
    ) {
        Sort sorting = switch (sort.toUpperCase()) {
            case "OLDEST" -> Sort.by(Sort.Direction.ASC, "registrationDate");
            case "SENTIMENT_DESC" -> Sort.by(Sort.Direction.DESC, "sentimentScore");
            case "SENTIMENT_ASC" -> Sort.by(Sort.Direction.ASC, "sentimentScore");
            default -> Sort.by(Sort.Direction.DESC, "registrationDate"); // LATEST is default
        };

        Pageable pageable = PageRequest.of(page, size, sorting);
        Page<ArticleResponse> response = articleService.getArticles(stockId, sectorId, category, pageable);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "뉴스 기사 감성 통계 조회", description = "특정 종목 또는 산업의 감성 통계(파이 차트, 트렌드, 관련 키워드)를 조회합니다.")
    @GetMapping("/sentiment/statistics")
    public ResponseEntity<com.stock.tomorrowMarket.article.dto.SentimentStatisticsResponse> getSentimentStatistics(
            @RequestParam(required = false) Long stockId,
            @RequestParam(required = false) Long sectorId
    ) {
        com.stock.tomorrowMarket.article.dto.SentimentStatisticsResponse response = articleService.getSentimentStatistics(stockId, sectorId);
        return ResponseEntity.ok(response);
    }
}
