package com.stock.tomorrowMarket.prediction.service;

import com.stock.tomorrowMarket.global.exception.CustomException;
import com.stock.tomorrowMarket.global.exception.ErrorCode;
import com.stock.tomorrowMarket.prediction.client.AiPredictionClient;
import com.stock.tomorrowMarket.prediction.dto.PredictionRequestResponseDto;
import com.stock.tomorrowMarket.prediction.dto.PredictionResponseDto;
import com.stock.tomorrowMarket.prediction.entity.Prediction;
import com.stock.tomorrowMarket.prediction.entity.PredictionRequest;
import com.stock.tomorrowMarket.prediction.entity.PredictionRun;
import com.stock.tomorrowMarket.prediction.entity.RequestStatus;
import com.stock.tomorrowMarket.prediction.entity.ResultSource;
import com.stock.tomorrowMarket.prediction.repository.PredictionRepository;
import com.stock.tomorrowMarket.prediction.repository.PredictionRunRepository;
import com.stock.tomorrowMarket.prediction.repository.PredictionRequestRepository;
import com.stock.tomorrowMarket.stock.entity.Stock;
import com.stock.tomorrowMarket.stock.repository.StockRepository;
import com.stock.tomorrowMarket.user.entity.Users;
import com.stock.tomorrowMarket.user.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PredictionRequestService {

    private final PredictionRequestRepository requestRepository;
    private final PredictionRunRepository predictionRunRepository;
    private final PredictionRepository predictionRepository;
    private final StockRepository stockRepository;
    private final UsersRepository usersRepository;
    private final AiPredictionClient aiPredictionClient;

    // F-004 & F-007: 사용자 재분석(On-demand) 요청 및 단기 캐시 로직
    @Transactional
    public PredictionRequestResponseDto requestReanalysis(Long usersId, Long stockId) {
        Users user = usersRepository.findById(usersId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new CustomException(ErrorCode.STOCK_NOT_FOUND));

        // 1. 단기 캐시 로직 (F-007): 최근 30분 이내에 ON_DEMAND로 생성된 예측이 있는지 확인
        LocalDateTime thirtyMinsAgo = LocalDateTime.now().minusMinutes(30);
        List<Prediction> recentPredictions = predictionRepository.findByStock_StockIdAndPredictionSourceOrderByBaseDatetimeDesc(stockId, "ON_DEMAND");
        if (!recentPredictions.isEmpty() && recentPredictions.get(0).getBaseDatetime().isAfter(thirtyMinsAgo)) {
            // 캐시 적중 -> 바로 완료된 요청 기록 남김
            PredictionRequest cachedRequest = PredictionRequest.builder()
                    .user(user)
                    .stock(stock)
                    .requestStatus(RequestStatus.COMPLETED)
                    .build();
            cachedRequest.updateStatus(RequestStatus.COMPLETED, ResultSource.CACHED_RESULT, null);
            return PredictionRequestResponseDto.from(requestRepository.save(cachedRequest));
        }

        // 2. 캐시가 없으면 새로운 PENDING 요청 생성
        PredictionRequest newRequest = PredictionRequest.builder()
                .user(user)
                .stock(stock)
                .requestStatus(RequestStatus.REQUESTED)
                .build();
        requestRepository.save(newRequest);

        try {
            // 3. PredictionRun 생성 (ON_DEMAND 용 - 단기 7일, 중장기 20일 총 2건 기대)
            PredictionRun predictionRun = PredictionRun.builder()
                    .runType("ON_DEMAND")
                    .scheduledBaseDate(LocalDate.now())
                    .totalStockCount(1)
                    .expectedResultCount(2)
                    .build();
            predictionRun.startRun();
            predictionRunRepository.save(predictionRun);

            // 4. AI 모델 서버 호출 (단기 및 중장기 2건 분리 생성)
            List<Prediction> generatedPredictions = aiPredictionClient.requestPredictions(stock, "ON_DEMAND", predictionRun);
            if (generatedPredictions == null || generatedPredictions.isEmpty()) {
                throw new RuntimeException("AI 서버로부터 예측 결과를 받지 못했습니다.");
            }
            predictionRepository.saveAll(generatedPredictions);

            // 5. PredictionRun 완료 처리
            predictionRun.finishRun("SUCCESS", generatedPredictions.size(), 0, null);

            // 6. 요청 상태 완료 업데이트
            newRequest.updateStatus(RequestStatus.COMPLETED, ResultSource.NEW_MODEL_RUN, predictionRun);
        } catch (Exception e) {
            newRequest.markAsFailed("AI 서버 통신 실패: " + e.getMessage());
            throw new CustomException(ErrorCode.AI_SERVER_ERROR);
        }

        return PredictionRequestResponseDto.from(newRequest);
    }

    // F-005: 재분석 진행 상태 조회
    @Transactional(readOnly = true)
    public PredictionRequestResponseDto getRequestStatus(Long requestId) {
        PredictionRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new CustomException(ErrorCode.PREDICTION_NOT_FOUND));
        return PredictionRequestResponseDto.from(request);
    }

    // F-006: 재분석 결과 반환 (단기 7일, 중장기 20일 최신 예측 세트 반환)
    @Transactional(readOnly = true)
    public List<PredictionResponseDto> getReanalysisResult(Long stockId) {
        List<Prediction> onDemandPredictions = predictionRepository.findByStock_StockIdAndPredictionSourceOrderByBaseDatetimeDesc(stockId, "ON_DEMAND");
        if (onDemandPredictions.isEmpty()) {
            throw new CustomException(ErrorCode.PREDICTION_NOT_FOUND);
        }
        LocalDateTime latestTime = onDemandPredictions.get(0).getBaseDatetime();
        return onDemandPredictions.stream()
                .filter(p -> p.getBaseDatetime() != null && latestTime != null 
                        && Math.abs(java.time.Duration.between(p.getBaseDatetime(), latestTime).toSeconds()) < 30)
                .map(PredictionResponseDto::from)
                .collect(Collectors.toList());
    }
}
