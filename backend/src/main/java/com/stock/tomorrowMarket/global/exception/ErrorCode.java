package com.stock.tomorrowMarket.global.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "해당 사용자를 찾을 수 없습니다."),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "DUPLICATE_EMAIL", "이미 존재하는 이메일입니다."),
    INVALID_EMAIL_CODE(HttpStatus.BAD_REQUEST, "INVALID_EMAIL_CODE", "유효하지 않거나 만료된 인증번호입니다."),
    EMAIL_NOT_VERIFIED(HttpStatus.UNAUTHORIZED, "EMAIL_NOT_VERIFIED", "이메일 인증이 완료되지 않았습니다."),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "INVALID_PASSWORD", "비밀번호가 일치하지 않습니다."),
    INACTIVE_USER(HttpStatus.FORBIDDEN, "INACTIVE_USER", "비활성화된 사용자입니다."),
    STOCK_NOT_FOUND(HttpStatus.NOT_FOUND, "STOCK_NOT_FOUND", "해당 종목을 찾을 수 없습니다."),
    SECTOR_NOT_FOUND(HttpStatus.NOT_FOUND, "SECTOR_NOT_FOUND", "해당 산업군을 찾을 수 없습니다."),
    ARTICLE_NOT_FOUND(HttpStatus.NOT_FOUND, "ARTICLE_NOT_FOUND", "해당 기사를 찾을 수 없습니다."),
    PREDICTION_NOT_FOUND(HttpStatus.NOT_FOUND, "PREDICTION_NOT_FOUND", "예측 결과를 찾을 수 없습니다."),
    PREDICTION_RUN_NOT_FOUND(HttpStatus.NOT_FOUND, "PREDICTION_RUN_NOT_FOUND", "예측 실행 기록을 찾을 수 없습니다."),
    PREDICTION_FAILURE_NOT_FOUND(HttpStatus.NOT_FOUND, "PREDICTION_FAILURE_NOT_FOUND", "예측 실패 기록을 찾을 수 없습니다."),
    DUPLICATE_WATCHLIST(HttpStatus.CONFLICT, "DUPLICATE_WATCHLIST", "이미 관심 종목으로 등록되었습니다."),
    DUPLICATE_INTEREST(HttpStatus.CONFLICT, "DUPLICATE_INTEREST", "이미 관심 산업군으로 등록되었습니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "INVALID_TOKEN", "유효하지 않은 토큰입니다."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "EXPIRED_TOKEN", "만료된 토큰입니다."),
    AI_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "AI_SERVER_ERROR", "AI 서버 통신 중 오류가 발생했습니다."),
    PREDICTION_EXECUTION_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "PREDICTION_EXECUTION_ERROR", "예측 실행 중 오류가 발생했습니다."),
    EXTERNAL_API_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "EXTERNAL_API_ERROR", "외부 API 통신 중 오류가 발생했습니다."),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "인증이 필요합니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "FORBIDDEN", "권한이 없습니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", "서버 내부 오류가 발생했습니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus httpStatus, String code, String message) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.message = message;
    }
}
