package com.stock.tomorrowMarket.prediction.controller;

import com.stock.tomorrowMarket.prediction.dto.PredictionResponseDto;
import com.stock.tomorrowMarket.prediction.service.PredictionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class PredictionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PredictionService predictionService;

    @Test
    @DisplayName("종목별 최신 예측 조회 성공 시 200과 데이터 반환")
    @WithMockUser
    void getLatestPredictionByStock_Success() throws Exception {
        // given
        PredictionResponseDto responseDto = PredictionResponseDto.builder()
                .predictionPrice(BigDecimal.valueOf(80000))
                .targetDate(LocalDate.now().plusDays(7))
                .predictedDirection("UP")
                .build();
        
        given(predictionService.getLatestPredictionByStock(eq(1L), eq("SCHEDULED_WEEKLY"))).willReturn(responseDto);

        // when & then
        mockMvc.perform(get("/api/predictions/stocks/1/latest")
                .param("source", "SCHEDULED_WEEKLY")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.predictedDirection").value("UP"));
    }

    @Test
    @DisplayName("산업군별 최신 예측 리스트 조회 성공 시 200과 데이터 반환")
    @WithMockUser
    void getLatestPredictionsBySector_Success() throws Exception {
        // given
        PredictionResponseDto responseDto = PredictionResponseDto.builder()
                .predictionPrice(BigDecimal.valueOf(80000))
                .targetDate(LocalDate.now().plusDays(7))
                .predictedDirection("UP")
                .build();
        
        given(predictionService.getLatestPredictionsBySector(eq(10L), eq("SCHEDULED_WEEKLY"))).willReturn(List.of(responseDto));

        // when & then
        mockMvc.perform(get("/api/predictions/sectors/10/latest")
                .param("source", "SCHEDULED_WEEKLY")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].predictedDirection").value("UP"));
    }

    @Test
    @DisplayName("종목별 과거 예측 이력 페이징 조회 성공 시 200과 데이터 반환")
    @WithMockUser
    void getPredictionHistoryByStock_Success() throws Exception {
        // given
        PredictionResponseDto responseDto = PredictionResponseDto.builder()
                .predictionPrice(BigDecimal.valueOf(80000))
                .targetDate(LocalDate.now().plusDays(7))
                .predictedDirection("UP")
                .build();
        
        given(predictionService.getPredictionHistoryByStock(eq(1L), eq("SCHEDULED_WEEKLY"), any(Pageable.class)))
                .willReturn(new PageImpl<>(List.of(responseDto)));

        // when & then
        mockMvc.perform(get("/api/predictions/stocks/1/history")
                .param("source", "SCHEDULED_WEEKLY")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].predictedDirection").value("UP"));
    }
}
