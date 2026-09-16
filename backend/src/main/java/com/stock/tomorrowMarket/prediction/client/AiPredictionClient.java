package com.stock.tomorrowMarket.prediction.client;

import com.stock.tomorrowMarket.prediction.entity.Prediction;
import com.stock.tomorrowMarket.prediction.entity.PredictionRun;
import com.stock.tomorrowMarket.stock.entity.Stock;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class AiPredictionClient {

    @Value("${ai-service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate;

    public AiPredictionClient() {
        this.restTemplate = new RestTemplate();
    }

    public List<Prediction> requestBatchPredictions(List<Stock> stocks, String runType, PredictionRun predictionRun) {
        String url = aiServiceUrl + "/api/v1/predict/batch";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        List<Map<String, String>> targetSymbols = stocks.stream()
                .map(s -> {
                    Map<String, String> m = new HashMap<>();
                    m.put("symbol", s.getStockCode());
                    // Assuming Stock entity has a sector/industry field, fallback to "common" or similar if not
                    m.put("industry", s.getSector() != null ? s.getSector().getSectorName() : "ITAndSemiconductor");
                    return m;
                }).collect(Collectors.toList());

        List<String> horizons = "ALL".equalsIgnoreCase(runType) ? List.of("SHORT", "LONG") : List.of(runType.toUpperCase());

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("base_date", LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)); // or predictionRun.getScheduledBaseDate()
        requestBody.put("target_symbols", targetSymbols);
        requestBody.put("horizons", horizons);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                new ParameterizedTypeReference<Map<String, Object>>() {}
        );

        List<Prediction> predictions = new ArrayList<>();
        Map<String, Object> body = response.getBody();
        if (body != null && "SUCCESS".equals(body.get("status"))) {
            List<Map<String, Object>> preds = (List<Map<String, Object>>) body.get("predictions");
            for (Map<String, Object> p : preds) {
                String symbol = (String) p.get("symbol");
                String targetDateStr = (String) p.get("target_date");
                Double val = (Double) p.get("predicted_value");
                String horizon = (String) p.get("horizon");

                Stock targetStock = stocks.stream().filter(s -> s.getStockCode().equals(symbol)).findFirst().orElse(null);
                if (targetStock != null) {
                    predictions.add(Prediction.builder()
                            .stock(targetStock)
                            .predictionRun(predictionRun)
                            .predictionPrice(BigDecimal.valueOf(val))
                            .targetDate(LocalDate.parse(targetDateStr))
                            .predictionSource("TFT-LightGBM")
                            .predictionPeriod("LONG".equals(horizon) ? 20 : 7)
                            .baseDate(LocalDate.now())
                            .baseDatetime(LocalDateTime.now())
                            .basePrice(BigDecimal.ZERO) // or fetch current base price
                            .predictedReturnRate(BigDecimal.ZERO) // calculate if needed
                            .predictedDirection(val > 0 ? "UP" : "DOWN")
                            .build());
                }
            }
        } else {
            throw new RuntimeException("AI Service returned failure status or empty body.");
        }

        return predictions;
    }
}
