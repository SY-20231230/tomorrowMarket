package com.stock.tomorrowMarket.batch.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stock.tomorrowMarket.batch.dto.CrawlingDoneWebhookRequestDto;
import com.stock.tomorrowMarket.batch.service.BatchService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@TestPropertySource(properties = {"app.webhook.secret=my-secret-key"})
class BatchControllerWebhookTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BatchService batchService;

    @Test
    @DisplayName("시크릿 키가 일치하면 웹훅 요청이 성공한다")
    void crawlingDoneWebhook_Success() throws Exception {
        // given
        CrawlingDoneWebhookRequestDto requestDto = CrawlingDoneWebhookRequestDto.builder()
                .status("SUCCESS")
                .newArticleIds(List.of(101L, 102L))
                .build();

        // when & then
        mockMvc.perform(post("/api/batch/crawling-done")
                .header("X-Webhook-Secret", "my-secret-key")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value("Webhook received successfully."));

        verify(batchService).handleCrawlingDoneWebhook(any(CrawlingDoneWebhookRequestDto.class));
    }

    @Test
    @DisplayName("시크릿 키가 불일치하거나 누락되면 예외(401 Unauthorized 등)가 발생한다")
    void crawlingDoneWebhook_Unauthorized_WhenSecretIsInvalid() throws Exception {
        // given
        CrawlingDoneWebhookRequestDto requestDto = CrawlingDoneWebhookRequestDto.builder()
                .status("SUCCESS")
                .newArticleIds(List.of(101L, 102L))
                .build();

        // when & then: 시크릿 키 불일치
        mockMvc.perform(post("/api/batch/crawling-done")
                .header("X-Webhook-Secret", "wrong-secret-key")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)))
                // 프로젝트의 ExceptionHandler 설정에 따라 401 권한 오류(또는 400 등)가 발생
                .andExpect(status().isUnauthorized()); // CustomException(ErrorCode.UNAUTHORIZED) 매핑 기준

        // when & then: 헤더 누락
        mockMvc.perform(post("/api/batch/crawling-done")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isUnauthorized()); // CustomException(ErrorCode.UNAUTHORIZED) 매핑 기준
    }
}
