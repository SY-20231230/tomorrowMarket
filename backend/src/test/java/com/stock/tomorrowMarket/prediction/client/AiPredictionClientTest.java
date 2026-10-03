package com.stock.tomorrowMarket.prediction.client;

import com.stock.tomorrowMarket.prediction.entity.Prediction;
import com.stock.tomorrowMarket.prediction.entity.PredictionRun;
import com.stock.tomorrowMarket.stock.entity.Stock;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiPredictionClientTest {

    @Mock
    private RestTemplateBuilder builder;

    @Mock
    private RestTemplate restTemplate;

    private AiPredictionClient aiPredictionClient;

    @BeforeEach
    void setUp() {
        when(builder.build()).thenReturn(restTemplate);
        aiPredictionClient = new AiPredictionClient(builder);
        ReflectionTestUtils.setField(aiPredictionClient, "aiServiceUrl", "http://localhost:8000");
    }

    @Test
    @DisplayName("FastAPI 정상 응답 시 Prediction 엔티티 리스트로 파싱된다")
    void requestBatchPredictions_Success() {
        // given
        Stock stock = Stock.builder().stockCode("005930").name("삼성전자").build();
        PredictionRun run = PredictionRun.builder().build();

        Map<String, Object> predictionData = new HashMap<>();
        predictionData.put("symbol", "005930");
        predictionData.put("target_date", "2023-11-10");
        predictionData.put("predicted_value", 5.5);
        predictionData.put("horizon", "SHORT");

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("status", "SUCCESS");
        responseBody.put("predictions", List.of(predictionData));

        ResponseEntity<Map<String, Object>> responseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(
                anyString(),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                ArgumentMatchers.<ParameterizedTypeReference<Map<String, Object>>>any()
        )).thenReturn(responseEntity);

        // when
        List<Prediction> result = aiPredictionClient.requestBatchPredictions(List.of(stock), "SHORT", run);

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStock().getStockCode()).isEqualTo("005930");
        assertThat(result.get(0).getPredictionPrice()).isEqualByComparingTo(BigDecimal.valueOf(5.5));
        assertThat(result.get(0).getPredictedDirection()).isEqualTo("UP");
    }

    @Test
    @DisplayName("FastAPI 응답 상태가 SUCCESS가 아닐 경우 예외가 발생한다")
    void requestBatchPredictions_Fail_ThrowsException() {
        // given
        Stock stock = Stock.builder().stockCode("005930").name("삼성전자").build();
        PredictionRun run = PredictionRun.builder().build();

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("status", "ERROR"); // Not SUCCESS

        ResponseEntity<Map<String, Object>> responseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(
                anyString(),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                ArgumentMatchers.<ParameterizedTypeReference<Map<String, Object>>>any()
        )).thenReturn(responseEntity);

        // when & then
        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            aiPredictionClient.requestBatchPredictions(List.of(stock), "SHORT", run);
        });
        assertThat(ex.getMessage()).contains("AI Service returned failure status or empty body");
    }
}
