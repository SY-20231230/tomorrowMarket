package com.stock.tomorrowMarket.stock.service;

import com.stock.tomorrowMarket.stock.dto.StockDetailResponse;
import com.stock.tomorrowMarket.stock.dto.StockHistoryResponse;
import com.stock.tomorrowMarket.stock.dto.StockResponse;
import com.stock.tomorrowMarket.stock.entity.MarketType;
import com.stock.tomorrowMarket.stock.entity.Stock;
import com.stock.tomorrowMarket.stock.entity.StockHistory;
import com.stock.tomorrowMarket.stock.repository.StockHistoryRepository;
import com.stock.tomorrowMarket.stock.repository.StockRepository;
import com.stock.tomorrowMarket.stock.repository.StockSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.stock.tomorrowMarket.global.exception.CustomException;
import com.stock.tomorrowMarket.global.exception.ErrorCode;

import java.time.LocalDate;
import com.stock.tomorrowMarket.global.exception.CustomException;
import com.stock.tomorrowMarket.global.exception.ErrorCode;
import com.stock.tomorrowMarket.log.service.SearchLogService;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StockService {

    private final StockRepository stockRepository;
    private final StockHistoryRepository stockHistoryRepository;
    private final SearchLogService searchLogService;

    public Page<StockResponse> getStocks(String keyword, Long sectorId, MarketType marketType, Pageable pageable) {
        Specification<Stock> spec = StockSpecification.searchStocks(keyword, sectorId, marketType);
        Page<Stock> stocks = stockRepository.findAll(spec, pageable);
        return stocks.map(stock -> {
            StockHistory latestHistory = stockHistoryRepository.findFirstByStockOrderByHistoryDateDesc(stock).orElse(null);
            return StockResponse.of(stock, latestHistory);
        });
    }

    @Transactional
    public StockDetailResponse getStockDetail(Long stockId, Long userId) {
        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new CustomException(ErrorCode.STOCK_NOT_FOUND));
        
        StockHistory latestHistory = stockHistoryRepository.findFirstByStockOrderByHistoryDateDesc(stock)
                .orElse(null);

        return StockDetailResponse.of(stock, latestHistory);
    }

    public List<StockHistoryResponse> getStockHistory(Long stockId, LocalDate startDate, LocalDate endDate) {
        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new CustomException(ErrorCode.STOCK_NOT_FOUND));

        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(6);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        List<StockHistory> historyList = stockHistoryRepository.findByStockAndHistoryDateBetweenOrderByHistoryDateAsc(stock, startDate, endDate);

        return historyList.stream()
                .map(StockHistoryResponse::from)
                .collect(Collectors.toList());
    }
}
