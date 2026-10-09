package com.stock.tomorrowMarket.auth.controller;

import com.stock.tomorrowMarket.auth.dto.*;
import com.stock.tomorrowMarket.auth.service.AuthService;
import com.stock.tomorrowMarket.global.security.CustomUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.stock.tomorrowMarket.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Auth", description = "인증 관련 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

        private final AuthService authService;

        @Operation(summary = "회원가입", description = "이메일 인증을 완료한 후 회원가입을 진행합니다.")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "회원가입 성공"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잘못된 입력값"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "이메일 인증 미완료"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "이미 존재하는 이메일")
        })
        @PostMapping("/signup")
        public ResponseEntity<ApiResponse<String>> signup(@Valid @RequestBody SignUpRequest request) {
                authService.signup(request);
                return ResponseEntity.ok(ApiResponse.success("회원가입 성공"));
        }

        @Operation(summary = "로그인", description = "이메일과 비밀번호로 로그인합니다. 성공 시 HttpOnly 쿠키로 토큰이 발급됩니다.")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "로그인 성공"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "비밀번호 불일치"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "비활성화된 사용자"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음")
        })
        @PostMapping("/login")
        public ResponseEntity<ApiResponse<String>> login(@Valid @RequestBody LoginRequest request,
                        HttpServletRequest httpRequest) {
                TokenResponse response = authService.login(request);
                boolean isSecure = httpRequest.isSecure();
                boolean keep = request.keepLoggedIn() != null && request.keepLoggedIn();

                ResponseCookie accessCookie = ResponseCookie.from("accessToken", response.accessToken())
                                .httpOnly(true)
                                .secure(true)
                                .sameSite("None")
                                .path("/")
                                .maxAge(keep ? 3600 : -1) // 세션 쿠키 또는 1시간
                                .build();

                ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", response.refreshToken())
                                .httpOnly(true)
                                .secure(true)
                                .sameSite("None")
                                .path("/")
                                .maxAge(keep ? 14 * 24 * 3600 : -1) // 세션 쿠키 또는 14일
                                .build();

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                                .body(ApiResponse.success("로그인 성공"));
        }

        @Operation(summary = "이메일 중복 확인", description = "해당 이메일이 이미 가입되어 있는지 확인합니다.")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "사용 가능한 이메일"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "이미 존재하는 이메일")
        })
        @GetMapping("/email/check")
        public ResponseEntity<ApiResponse<String>> checkEmail(@RequestParam String email) {
                authService.checkEmail(email);
                return ResponseEntity.ok(ApiResponse.success("사용 가능한 이메일입니다."));
        }

        @Operation(summary = "토큰 재발급", description = "HttpOnly 쿠키에 저장된 RefreshToken을 통해 AccessToken을 재발급받습니다.")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "토큰 재발급 성공"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "리프레시 토큰 누락 또는 유효하지 않음")
        })
        @PostMapping("/refresh")
        public ResponseEntity<ApiResponse<String>> refresh(
                        @CookieValue(value = "refreshToken", required = false) String refreshToken,
                        HttpServletRequest httpRequest) {
                if (refreshToken == null) {
                        // ErrorResponse는 CustomException을 통해 반환되는 것이 원칙이나, 여기서는 Filter가 아닌 직접 체크하므로 별도
                        // 반환
                        // 하지만 이 API 자체가 401을 명시해야 하므로 Map.of 대신 제대로 던지거나 예외 처리로 던지는게 맞습니다.
                        // 여기서는 통일성을 위해 간단히 예외를 던지도록 수정하겠습니다. (GlobalExceptionHandler가 처리)
                        throw new com.stock.tomorrowMarket.global.exception.CustomException(
                                        com.stock.tomorrowMarket.global.exception.ErrorCode.INVALID_TOKEN);
                }

                TokenResponse response = authService.refresh(refreshToken);
                boolean isSecure = httpRequest.isSecure();

                ResponseCookie accessCookie = ResponseCookie.from("accessToken", response.accessToken())
                                .httpOnly(true)
                                .secure(true)
                                .sameSite("None")
                                .path("/")
                                .maxAge(3600) // Access Token은 갱신 시점으로부터 1시간 (기존 세션 유지 여부는 refreshToken의 수명에 달려있음)
                                .build();

                // refreshToken은 기존 쿠키 수명을 유지하기 위해 새로 덮어쓰지 않습니다.
                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                                .body(ApiResponse.success("토큰 재발급 성공"));
        }

        @Operation(summary = "로그아웃", description = "로그아웃 처리하고 발급된 HttpOnly 쿠키 토큰들을 모두 만료시킵니다.")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "로그아웃 성공")
        })
        @PostMapping("/logout")
        public ResponseEntity<ApiResponse<String>> logout(@AuthenticationPrincipal CustomUserDetails userDetails,
                        HttpServletRequest httpRequest) {
                if (userDetails != null) {
                        authService.logout(userDetails.getUsersId());
                }
                boolean isSecure = httpRequest.isSecure();

                ResponseCookie accessCookie = ResponseCookie.from("accessToken", "")
                                .httpOnly(true)
                                .secure(true)
                                .sameSite("None")
                                .path("/")
                                .maxAge(0)
                                .build();

                ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", "")
                                .httpOnly(true)
                                .secure(true)
                                .sameSite("None")
                                .path("/")
                                .maxAge(0)
                                .build();

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                                .body(ApiResponse.success("로그아웃 성공"));
        }

        @Operation(summary = "비밀번호 재설정 메일 발송", description = "비밀번호를 분실한 사용자의 이메일로 비밀번호 재설정 링크를 발송합니다.")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "비밀번호 재설정 메일 발송 완료"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음")
        })
        @PostMapping("/password/reset-request")
        public ResponseEntity<ApiResponse<String>> requestPasswordReset(
                        @Valid @RequestBody PasswordResetRequest request) {
                authService.requestPasswordReset(request);
                return ResponseEntity.ok(ApiResponse.success("비밀번호 재설정 메일 발송 완료"));
        }

        @Operation(summary = "비밀번호 재설정", description = "발급받은 토큰과 함께 새로운 비밀번호를 설정합니다.")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "비밀번호 재설정 완료"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "유효하지 않거나 만료된 토큰")
        })
        @PutMapping("/password/reset")
        public ResponseEntity<ApiResponse<String>> resetPassword(
                        @Valid @RequestBody PasswordResetConfirmRequest request) {
                authService.resetPassword(request);
                return ResponseEntity.ok(ApiResponse.success("비밀번호 재설정 완료"));
        }
}
