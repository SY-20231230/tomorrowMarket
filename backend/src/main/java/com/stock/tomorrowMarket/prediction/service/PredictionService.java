package com.stock.tomorrowMarket.prediction.service;

import com.stock.tomorrowMarket.global.exception.CustomException;
import com.stock.tomorrowMarket.global.exception.ErrorCode;
import com.stock.tomorrowMarket.prediction.dto.PredictionResponseDto;
import com.stock.tomorrowMarket.prediction.entity.Prediction;
import com.stock.tomorrowMarket.prediction.repository.PredictionRepository;
import com.stock.tomorrowMarket.stock.entity.Stock;
import com.stock.tomorrowMarket.stock.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PredictionService {

    private final PredictionRepository predictionRepository;
    private final StockRepository stockRepository;

    // F-001: 종목별 최신 정기 예측 조회
    public PredictionResponseDto getLatestPredictionByStock(Long stockId, String predictionSource) {
        Page<Prediction> page = predictionRepository.findByStock_StockIdAndPredictionSourceOrderByBaseDateDesc(
                stockId, predictionSource, PageRequest.of(0, 1));
        
        if (page.isEmpty()) {
            throw new CustomException(ErrorCode.PREDICTION_NOT_FOUND);
        }
        return PredictionResponseDto.from(page.getContent().get(0));
    }

    // F-002: 산업군별 최신 정기 예측 조회
    public List<PredictionResponseDto> getLatestPredictionsBySector(Long sectorId, String predictionSource) {
        List<Stock> stocks = stockRepository.findBySector_SectorsId(sectorId);
        if (stocks.isEmpty()) {
            throw new CustomException(ErrorCode.SECTOR_NOT_FOUND);
        }
        
        return stocks.stream()
                .map(stock -> {
                    Page<Prediction> page = predictionRepository.findByStock_StockIdAndPredictionSourceOrderByBaseDateDesc(
                            stock.getStockId(), predictionSource, PageRequest.of(0, 1));
                    return page.isEmpty() ? null : PredictionResponseDto.from(page.getContent().get(0));
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    // F-003: 특정 종목의 정기 예측 과거 이력 조회
    public Page<PredictionResponseDto> getPredictionHistoryByStock(Long stockId, String predictionSource, Pageable pageable) {
        Page<Prediction> page = predictionRepository.findByStock_StockIdAndPredictionSourceOrderByBaseDateDesc(
                stockId, predictionSource, pageable);
        return page.map(PredictionResponseDto::from);
    }
}
