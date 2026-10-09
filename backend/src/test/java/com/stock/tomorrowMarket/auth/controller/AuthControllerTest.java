package com.stock.tomorrowMarket.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stock.tomorrowMarket.auth.dto.LoginRequest;
import com.stock.tomorrowMarket.auth.dto.SignUpRequest;
import com.stock.tomorrowMarket.auth.dto.TokenResponse;
import com.stock.tomorrowMarket.auth.service.AuthService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @Test
    @DisplayName("회원가입 성공 시 200 반환 및 성공 응답 구조(ApiResponse) 확인")
    void signup_Success() throws Exception {
        SignUpRequest request = new SignUpRequest("test@test.com", "홍길동", "Password123!", LocalDate.of(1990, 1, 1));

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value("회원가입 성공"));

        verify(authService).signup(any(SignUpRequest.class));
    }

    @Test
    @DisplayName("로그인 성공 시 HttpOnly 쿠키(accessToken, refreshToken) 발급 확인")
    void login_Success() throws Exception {
        LoginRequest request = new LoginRequest("test@test.com", "Password123!", true);
        TokenResponse mockResponse = TokenResponse.of("mockAccessToken", "mockRefreshToken");
        
        given(authService.login(any(LoginRequest.class))).willReturn(mockResponse);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(cookie().exists("accessToken"))
                .andExpect(cookie().httpOnly("accessToken", true))
                .andExpect(cookie().exists("refreshToken"))
                .andExpect(cookie().httpOnly("refreshToken", true));
    }

    @Test
    @WithMockUser
    @DisplayName("로그아웃 성공 시 쿠키 Max-Age가 0으로 초기화되는지 확인")
    void logout_Success() throws Exception {
        mockMvc.perform(post("/api/auth/logout")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("accessToken", 0))
                .andExpect(cookie().maxAge("refreshToken", 0));
    }

    @Test
    @DisplayName("토큰 재발급(Refresh) 성공 시 새로운 accessToken 쿠키가 덮어씌워지는지 확인")
    void refresh_Success() throws Exception {
        Cookie refreshCookie = new Cookie("refreshToken", "validRefreshToken");
        TokenResponse mockResponse = TokenResponse.of("newAccessToken", "validRefreshToken");

        given(authService.refresh("validRefreshToken")).willReturn(mockResponse);

        mockMvc.perform(post("/api/auth/refresh")
                .cookie(refreshCookie)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("accessToken"))
                .andExpect(cookie().value("accessToken", "newAccessToken"))
                .andExpect(jsonPath("$.success").value(true));
    }
}
