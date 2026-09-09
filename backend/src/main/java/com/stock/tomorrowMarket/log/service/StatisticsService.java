package com.stock.tomorrowMarket.log.service;

import com.stock.tomorrowMarket.log.dto.AccessLogStatsDto;
import com.stock.tomorrowMarket.log.dto.SearchLogStatsDto;
import com.stock.tomorrowMarket.log.repository.AccessLogRepository;
import com.stock.tomorrowMarket.log.repository.SearchLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final AccessLogRepository accessLogRepository;
    private final SearchLogRepository searchLogRepository;

    // J-001: 일별/기간별 접속량 및 유입 경로 통계
    @Transactional(readOnly = true)
    public AccessLogStatsDto getAccessStatistics(LocalDateTime startTime, LocalDateTime endTime) {
        Long totalAccessCount = accessLogRepository.countByAccessTimeBetween(startTime, endTime);
        if (totalAccessCount == null) {
            totalAccessCount = 0L;
        }
        
        List<Object[]> sourceStats = accessLogRepository.countBySourceTypeGrouped(startTime, endTime);
        Map<String, Long> accessBySource = new HashMap<>();
        for (Object[] stat : sourceStats) {
            String source = (String) stat[0];
            Long count = (Long) stat[1];
            accessBySource.put(source, count);
        }

        return AccessLogStatsDto.builder()
                .totalAccessCount(totalAccessCount)
                .accessBySource(accessBySource)
                .build();
    }

    // J-002: 최근 최다 검색 종목 통계 (Top N)
    @Transactional(readOnly = true)
    public List<SearchLogStatsDto> getTopSearchedStocks(LocalDateTime startTime, LocalDateTime endTime, int limit) {
        List<Object[]> topStocks = searchLogRepository.findTopSearchedStocksWithDetails(startTime, endTime, PageRequest.of(0, limit));
        
        return topStocks.stream().map(stat -> SearchLogStatsDto.builder()
                .stockId((Long) stat[0])
                .stockName((String) stat[1])
                .searchCount((Long) stat[2])
                .build()).collect(Collectors.toList());
    }
}
