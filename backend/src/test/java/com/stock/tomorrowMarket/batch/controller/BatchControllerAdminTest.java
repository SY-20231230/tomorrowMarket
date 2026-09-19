package com.stock.tomorrowMarket.batch.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stock.tomorrowMarket.batch.dto.BatchExecutionRequestDto;
import com.stock.tomorrowMarket.batch.dto.BatchResponseDto;
import com.stock.tomorrowMarket.batch.service.BatchService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class BatchControllerAdminTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BatchService batchService;

    @Test
    @DisplayName("관리자(ADMIN) 권한으로 수동 예측 배치(WEEKLY_SHORT) 강제 구동 API 호출 성공")
    @WithMockUser(roles = "ADMIN")
    void executeBatch_Admin_Success() throws Exception {
        BatchExecutionRequestDto requestDto = BatchExecutionRequestDto.builder()
                .runType("WEEKLY_SHORT")
                .scheduledBaseDate(LocalDate.now())
                .build();

        BatchResponseDto mockResponse = BatchResponseDto.builder()
                .predictionRunId(1L)
                .runType("WEEKLY_SHORT")
                .runStatus("COMPLETED")
                .scheduledBaseDate(LocalDate.now())
                .build();

        given(batchService.executeBatch(any(BatchExecutionRequestDto.class))).willReturn(mockResponse);

        mockMvc.perform(post("/api/batch/runs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.runType").value("WEEKLY_SHORT"))
                .andExpect(jsonPath("$.data.runStatus").value("COMPLETED"));

        verify(batchService).executeBatch(any(BatchExecutionRequestDto.class));
    }

    @Test
    @DisplayName("일반 사용자(USER) 권한으로 강제 구동 API 호출 시 403 Forbidden 반환")
    @WithMockUser(roles = "USER")
    void executeBatch_User_Forbidden() throws Exception {
        BatchExecutionRequestDto requestDto = BatchExecutionRequestDto.builder()
                .runType("WEEKLY_SHORT")
                .scheduledBaseDate(LocalDate.now())
                .build();

        mockMvc.perform(post("/api/batch/runs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isForbidden());
    }
}
