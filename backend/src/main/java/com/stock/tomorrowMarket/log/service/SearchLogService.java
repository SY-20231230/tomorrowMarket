package com.stock.tomorrowMarket.log.service;

import com.stock.tomorrowMarket.log.entity.SearchLog;
import com.stock.tomorrowMarket.log.repository.SearchLogRepository;
import com.stock.tomorrowMarket.stock.dto.StockResponse;
import com.stock.tomorrowMarket.stock.entity.Stock;
import com.stock.tomorrowMarket.stock.repository.StockRepository;
import com.stock.tomorrowMarket.user.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchLogService {

    private final SearchLogRepository searchLogRepository;
    private final UsersRepository usersRepository;
    private final StockRepository stockRepository;

    /**
     * 프롬프트 18장: 종목 상세 조회 시 로그인 사용자의 검색 기록을 저장한다.
     * 로그 저장 실패가 핵심 API 응답 실패로 이어지지 않도록 처리한다.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logStockSearch(Long userId, Stock stock) {
        if (userId == null || stock == null) {
            return;
        }
        try {
            usersRepository.findById(userId).ifPresent(user -> {
                SearchLog searchLog = SearchLog.builder()
                        .user(user)
                        .stock(stock)
                        .build();
                searchLogRepository.save(searchLog);
            });
        } catch (Exception e) {
            log.error("검색 로그 저장 중 오류 발생 (userId: {}, stockId: {}): {}", userId, stock.getStockId(), e.getMessage());
        }
    }

    /**
     * B-009: 사용자의 최근 조회 종목 목록 조회
     */
    @Transactional(readOnly = true)
    public List<StockResponse> getRecentStocks(Long userId, int limit) {
        if (userId == null) {
            return Collections.emptyList();
        }

        List<Long> recentStockIds = searchLogRepository.findRecentStockIdsByUserId(userId, PageRequest.of(0, limit));
        if (recentStockIds.isEmpty()) {
            return Collections.emptyList();
        }

        Map<Long, Stock> stockMap = stockRepository.findAllById(recentStockIds).stream()
                .collect(Collectors.toMap(Stock::getStockId, Function.identity()));

        List<StockResponse> result = new ArrayList<>();
        for (Long stockId : recentStockIds) {
            Stock stock = stockMap.get(stockId);
            if (stock != null) {
                result.add(StockResponse.from(stock));
            }
        }
        return result;
    }
}
