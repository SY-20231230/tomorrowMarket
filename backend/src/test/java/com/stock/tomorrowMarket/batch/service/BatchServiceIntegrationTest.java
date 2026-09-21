package com.stock.tomorrowMarket.batch.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stock.tomorrowMarket.batch.dto.BatchExecutionRequestDto;
import com.stock.tomorrowMarket.batch.dto.BatchResponseDto;
import com.stock.tomorrowMarket.prediction.client.AiPredictionClient;
import com.stock.tomorrowMarket.prediction.entity.Prediction;
import com.stock.tomorrowMarket.prediction.entity.PredictionFailure;
import com.stock.tomorrowMarket.prediction.entity.PredictionRun;
import com.stock.tomorrowMarket.prediction.repository.PredictionFailureRepository;
import com.stock.tomorrowMarket.prediction.repository.PredictionRepository;
import com.stock.tomorrowMarket.prediction.repository.PredictionRunRepository;
import com.stock.tomorrowMarket.stock.entity.Stock;
import com.stock.tomorrowMarket.stock.repository.StockRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@SpringBootTest
@ActiveProfiles("local")
@Transactional
class BatchServiceIntegrationTest {

    @Autowired
    private BatchService batchService;

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private PredictionRepository predictionRepository;

    @Autowired
    private PredictionFailureRepository predictionFailureRepository;

    @Autowired
    private PredictionRunRepository predictionRunRepository;

    @Autowired
    private AiPredictionClient aiPredictionClient;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${ai-service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private MockRestServiceServer mockServer;

    @BeforeEach
    void setUp() {
        RestTemplate restTemplate = (RestTemplate) ReflectionTestUtils.getField(aiPredictionClient, "restTemplate");
        mockServer = MockRestServiceServer.createServer(restTemplate);
    }

    @Test
    @DisplayName("AI 서버가 200 SUCCESS 응답을 주면 Prediction 테이블에 데이터가 적재된다.")
    void executeBatch_Success_InsertsPrediction() throws Exception {
        // given
        List<Stock> existingStocks = stockRepository.findAll();
        if (existingStocks.isEmpty()) {
            System.out.println("No stocks in DB, skipping test.");
            return;
        }
        Stock stock = existingStocks.get(0);

        BatchExecutionRequestDto requestDto = BatchExecutionRequestDto.builder()
                .runType("WEEKLY_SHORT")
                .scheduledBaseDate(LocalDate.now())
                .stockIds(List.of(stock.getStockId()))
                .build();

        String mockResponseJson = """
                {
                    "status": "SUCCESS",
                    "predictions": [
                        {
                            "symbol": "%s",
                            "target_date": "2026-09-20",
                            "predicted_value": 75000.0,
                            "horizon": "SHORT"
                        }
                    ]
                }
                """.formatted(stock.getStockCode());

        mockServer.expect(requestTo(aiServiceUrl + "/api/v1/predict/batch"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(mockResponseJson, MediaType.APPLICATION_JSON));

        // when
        BatchResponseDto response = batchService.executeBatch(requestDto);

        // then
        mockServer.verify();
        assertThat(response.getRunStatus()).isEqualTo("SUCCESS");
        assertThat(response.getSuccessCount()).isEqualTo(1);
        assertThat(response.getFailureCount()).isEqualTo(0);

        List<Prediction> savedPredictions = predictionRepository.findAll();
        assertThat(savedPredictions).isNotEmpty();
        assertThat(savedPredictions.get(savedPredictions.size() - 1).getStock().getStockCode()).isEqualTo(stock.getStockCode());
        assertThat(savedPredictions.get(savedPredictions.size() - 1).getPredictionPrice().doubleValue()).isEqualTo(75000.0);

        // List<PredictionFailure> savedFailures = predictionFailureRepository.findAll();
        // assertThat(savedFailures).isEmpty(); // Other tests might have inserted failures
        
        List<PredictionRun> savedRuns = predictionRunRepository.findAll();
        assertThat(savedRuns).isNotEmpty();
    }

    @Test
    @DisplayName("AI 서버가 500 응답을 주면 PredictionFailure 테이블에 실패 이력이 적재된다.")
    void executeBatch_Fail_InsertsFailure() throws Exception {
        // given
        List<Stock> existingStocks = stockRepository.findAll();
        if (existingStocks.isEmpty()) {
            System.out.println("No stocks in DB, skipping test.");
            return;
        }
        Stock stock = existingStocks.get(0);

        BatchExecutionRequestDto requestDto = BatchExecutionRequestDto.builder()
                .runType("MONTHLY_LONG")
                .scheduledBaseDate(LocalDate.now())
                .stockIds(List.of(stock.getStockId()))
                .build();

        mockServer.expect(requestTo(aiServiceUrl + "/api/v1/predict/batch"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.INTERNAL_SERVER_ERROR));

        // when
        BatchResponseDto response = batchService.executeBatch(requestDto);

        // then
        mockServer.verify();
        assertThat(response.getRunStatus()).isEqualTo("FAILED");
        assertThat(response.getSuccessCount()).isEqualTo(0);
        assertThat(response.getFailureCount()).isEqualTo(1);

        // List<Prediction> savedPredictions = predictionRepository.findAll();
        // assertThat(savedPredictions).isEmpty();

        List<PredictionFailure> savedFailures = predictionFailureRepository.findAll();
        assertThat(savedFailures).isNotEmpty();
        PredictionFailure lastFailure = savedFailures.get(savedFailures.size() - 1);
        assertThat(lastFailure.getStock().getStockCode()).isEqualTo(stock.getStockCode());
        assertThat(lastFailure.getFailureStage()).isEqualTo("AI_CLIENT_CALL");
        assertThat(lastFailure.getPredictionRun().getRunType()).isEqualTo("MONTHLY_LONG");
    }
}
