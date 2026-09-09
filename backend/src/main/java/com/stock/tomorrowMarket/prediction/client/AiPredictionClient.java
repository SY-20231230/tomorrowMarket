package com.stock.tomorrowMarket.prediction.client;

import com.stock.tomorrowMarket.prediction.entity.Prediction;
import com.stock.tomorrowMarket.stock.entity.Stock;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class AiPredictionClient {

    // 임시 Mock 구현: FastAPI 연동 전 (추후 RestClient/WebClient 연동)
    public Prediction requestPrediction(Stock stock, String predictionSource, com.stock.tomorrowMarket.prediction.entity.PredictionRun predictionRun) {
        return Prediction.builder()
                .stock(stock)
                .predictionRun(predictionRun)
                .predictionPrice(new BigDecimal("10500.00"))
                .targetDate(LocalDate.now().plusDays(1))
                .predictionSource(predictionSource)
                .predictionPeriod(1)
                .baseDate(LocalDate.now())
                .baseDatetime(LocalDateTime.now())
                .basePrice(new BigDecimal("10000.00"))
                .predictedReturnRate(new BigDecimal("5.00"))
                .predictedDirection("UP")
                .build();
    }
}
