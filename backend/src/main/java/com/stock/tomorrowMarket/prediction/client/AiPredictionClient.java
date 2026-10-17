package com.stock.tomorrowMarket.prediction.client;

import com.stock.tomorrowMarket.prediction.entity.Prediction;
import com.stock.tomorrowMarket.prediction.entity.PredictionRun;
import com.stock.tomorrowMarket.stock.entity.Stock;
import com.stock.tomorrowMarket.stock.entity.StockHistory;
import com.stock.tomorrowMarket.stock.repository.StockHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
import java.math.RoundingMode;
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

    @Value("${ai.server.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate;
    private final StockHistoryRepository stockHistoryRepository;

    public AiPredictionClient(org.springframework.boot.web.client.RestTemplateBuilder builder) {
        this(builder, null);
    }

    @Autowired
    public AiPredictionClient(org.springframework.boot.web.client.RestTemplateBuilder builder,
                              @Autowired(required = false) StockHistoryRepository stockHistoryRepository) {
        this.restTemplate = builder.build();
        this.stockHistoryRepository = stockHistoryRepository;
    }

    public static String mapSectorToEnglish(String sectorName) {
        if (sectorName == null) return "ITAndSemiconductor";
        if (sectorName.contains("반도체") || sectorName.contains("IT")) return "ITAndSemiconductor";
        if (sectorName.contains("커뮤니케이션")) return "Communication";
        if (sectorName.contains("소재")) return "Materials";
        if (sectorName.contains("헬스케어") || sectorName.contains("바이오")) return "Healthcare";
        if (sectorName.contains("금융")) return "Financial";
        if (sectorName.contains("산업재")) return "Industrial";
        if (sectorName.contains("에너지") || sectorName.contains("유틸리티")) return "Energy";
        if (sectorName.contains("항공") || sectorName.contains("해양") || sectorName.contains("해운")) return "Aviation";
        if (sectorName.contains("소비재")) return "Consumer";
        return "ITAndSemiconductor";
    }

    public List<Prediction> requestBatchPredictions(List<Stock> stocks, String runType, PredictionRun predictionRun) {
        String url = aiServiceUrl + "/api/v1/predict/batch";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        List<Map<String, String>> targetSymbols = stocks.stream()
                .map(s -> {
                    Map<String, String> m = new HashMap<>();
                    m.put("symbol", s.getStockCode());
                    String rawSector = s.getSector() != null ? s.getSector().getName() : null;
                    m.put("industry", mapSectorToEnglish(rawSector));
                    return m;
                }).collect(Collectors.toList());

        List<String> horizons = ("ALL".equalsIgnoreCase(runType) || "ON_DEMAND".equalsIgnoreCase(runType))
                ? List.of("SHORT", "LONG")
                : List.of(runType.toUpperCase());

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("base_date", LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE));
        requestBody.put("target_symbols", targetSymbols);
        requestBody.put("horizons", horizons);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                new ParameterizedTypeReference<Map<String, Object>>() {
                });

        List<Prediction> predictions = new ArrayList<>();
        Map<String, Object> body = response.getBody();
        if (body != null && "SUCCESS".equals(body.get("status"))) {
            List<Map<String, Object>> preds = (List<Map<String, Object>>) body.get("predictions");
            for (Map<String, Object> p : preds) {
                String symbol = (String) p.get("symbol");
                String targetDateStr = (String) p.get("target_date");
                Double val = (Double) p.get("predicted_value");
                String horizon = (String) p.get("horizon");

                Stock targetStock = stocks.stream().filter(s -> s.getStockCode().equals(symbol)).findFirst()
                        .orElse(null);
                if (targetStock != null) {
                    BigDecimal basePrice = BigDecimal.ZERO;
                    if (stockHistoryRepository != null) {
                        basePrice = stockHistoryRepository.findFirstByStockOrderByHistoryDateDesc(targetStock)
                                .map(StockHistory::getClosingPrice)
                                .orElse(BigDecimal.ZERO);
                    }

                    BigDecimal predPrice;
                    BigDecimal returnRate;
                    if (val != null && val > -1.0 && val < 1.0) {
                        // val is return ratio (e.g. 0.035 -> 3.5%)
                        returnRate = BigDecimal.valueOf(val * 100).setScale(2, RoundingMode.HALF_UP);
                        if (basePrice.compareTo(BigDecimal.ZERO) > 0) {
                            predPrice = basePrice.multiply(BigDecimal.ONE.add(BigDecimal.valueOf(val))).setScale(2, RoundingMode.HALF_UP);
                        } else {
                            predPrice = BigDecimal.valueOf(val).setScale(2, RoundingMode.HALF_UP);
                        }
                    } else if (val != null) {
                        // val is absolute price
                        predPrice = BigDecimal.valueOf(val).setScale(2, RoundingMode.HALF_UP);
                        if (basePrice.compareTo(BigDecimal.ZERO) > 0) {
                            returnRate = predPrice.subtract(basePrice)
                                    .divide(basePrice, 4, RoundingMode.HALF_UP)
                                    .multiply(BigDecimal.valueOf(100))
                                    .setScale(2, RoundingMode.HALF_UP);
                        } else {
                            returnRate = BigDecimal.valueOf(val).setScale(2, RoundingMode.HALF_UP);
                        }
                    } else {
                        predPrice = BigDecimal.ZERO;
                        returnRate = BigDecimal.ZERO;
                    }

                    String direction = returnRate.compareTo(BigDecimal.ZERO) >= 0 ? "UP" : "DOWN";

                    predictions.add(Prediction.builder()
                            .stock(targetStock)
                            .predictionRun(predictionRun)
                            .predictionPrice(predPrice)
                            .targetDate(LocalDate.parse(targetDateStr))
                            .predictionSource("ON_DEMAND".equalsIgnoreCase(runType) ? "ON_DEMAND" : "SCHEDULED_WEEKLY")
                            .modelName("TFT-LightGBM")
                            .predictionPeriod("LONG".equalsIgnoreCase(horizon) ? 20 : 5)
                            .baseDate(LocalDate.now())
                            .baseDatetime(LocalDateTime.now())
                            .basePrice(basePrice)
                            .predictedReturnRate(returnRate)
                            .predictedDirection(direction)
                            .build());
                }
            }
        } else {
            throw new RuntimeException("AI Service returned failure status or empty body.");
        }

        return predictions;
    }

    public List<Prediction> requestPredictions(Stock stock, String runType, PredictionRun predictionRun) {
        return requestBatchPredictions(List.of(stock), runType, predictionRun);
    }

    public Prediction requestPrediction(Stock stock, String runType, PredictionRun predictionRun) {
        List<Prediction> preds = requestPredictions(stock, runType, predictionRun);
        if (preds != null && !preds.isEmpty()) {
            return preds.get(0);
        }
        return null;
    }

    public void requestSentimentAnalysis(List<Long> articleIds) {
        String url = aiServiceUrl + "/api/v1/sentiment/analyze";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("article_ids", articleIds);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("[WEBHOOK] AI 서버 감성 분석 요청 성공 (대상 기사 ID: " + articleIds.size() + "건)");
            } else {
                System.err.println("[WEBHOOK] AI 서버 감성 분석 요청 실패 - 응답 코드: " + response.getStatusCode());
            }
        } catch (Exception e) {
            System.err.println("[WEBHOOK] AI 서버 감성 분석 요청 에러 - 원인: " + e.getMessage());
        }
    }

    public void triggerNewsCrawling() {
        String url = aiServiceUrl + "/api/v1/crawl/news";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("[SCHEDULED] AI 서버 뉴스 기사 자동 크롤링 트리거 성공 (응답: " + response.getBody() + ")");
            } else {
                System.err.println("[SCHEDULED] AI 서버 뉴스 크롤링 트리거 실패 - 응답 코드: " + response.getStatusCode());
            }
        } catch (Exception e) {
            System.err.println("[SCHEDULED] AI 서버 뉴스 크롤링 트리거 요청 에러 - 원인: " + e.getMessage());
        }
    }
}
