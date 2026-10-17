package com.stock.tomorrowMarket.batch.scheduler;

import com.stock.tomorrowMarket.prediction.client.AiPredictionClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NewsCrawlerScheduler {

    private final AiPredictionClient aiPredictionClient;

    /**
     * 매일 오전 06:00 (장 시작 전), 오후 17:00 (장 마감 후) 하루 2회 자동 실행
     * AI 서버로 뉴스 크롤링 비동기 트리거를 전송합니다.
     */
    @Scheduled(cron = "0 0 6,17 * * ?")
    public void runScheduledNewsCrawling() {
        log.info("[SCHEDULED] 정기 뉴스 기사 자동 수집 파이프라인 가동 시작...");
        try {
            aiPredictionClient.triggerNewsCrawling();
            log.info("[SCHEDULED] 뉴스 크롤링 트리거 신호가 AI 서버에 성공적으로 전달되었습니다.");
        } catch (Exception e) {
            log.error("[SCHEDULED] 뉴스 크롤링 스케줄러 실행 중 오류 발생: ", e);
        }
    }
}
