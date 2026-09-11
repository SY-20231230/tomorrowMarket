package com.stock.tomorrowMarket.admin.controller;

import com.stock.tomorrowMarket.admin.dto.AdminStockResponseDto;
import com.stock.tomorrowMarket.admin.dto.AdminStockStatusUpdateRequestDto;
import com.stock.tomorrowMarket.admin.dto.ModelVersionDto;
import com.stock.tomorrowMarket.admin.dto.DashboardDto;
import com.stock.tomorrowMarket.admin.dto.UserResponseDto;
import com.stock.tomorrowMarket.admin.dto.UserStatusUpdateRequestDto;
import com.stock.tomorrowMarket.prediction.dto.PredictionRequestResponseDto;
import com.stock.tomorrowMarket.admin.service.AdminService;
import com.stock.tomorrowMarket.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // H-001: 대시보드 통계
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/dashboard")
    public ApiResponse<DashboardDto> getDashboardStats() {
        return ApiResponse.success(adminService.getDashboardStats());
    }

    // H-002: 사용자 목록 조회
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public ApiResponse<Page<UserResponseDto>> getUsers(Pageable pageable) {
        return ApiResponse.success(adminService.getUsers(pageable));
    }

    // H-004: 사용자 상세 조회
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users/{usersId}")
    public ApiResponse<UserResponseDto> getUserDetails(@PathVariable("usersId") Long usersId) {
        return ApiResponse.success(adminService.getUserDetails(usersId));
    }

    // H-003: 사용자 상태 변경
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/users/{usersId}/status")
    public ApiResponse<UserResponseDto> changeUserStatus(
            @PathVariable("usersId") Long usersId,
            @Valid @RequestBody UserStatusUpdateRequestDto requestDto) {
        return ApiResponse.success(adminService.changeUserStatus(usersId, requestDto.getStatus()));
    }

    // H-005: 종목 관리 (목록 조회)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stocks")
    public ApiResponse<Page<AdminStockResponseDto>> getStocks(Pageable pageable) {
        return ApiResponse.success(adminService.getStocks(pageable));
    }

    // H-005: 종목 상태 변경
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/stocks/{stockId}/status")
    public ApiResponse<AdminStockResponseDto> changeStockStatus(
            @PathVariable("stockId") Long stockId,
            @Valid @RequestBody AdminStockStatusUpdateRequestDto requestDto) {
        return ApiResponse.success(adminService.changeStockStatus(stockId, requestDto.getIsActive()));
    }

    // H-006: 모델 버전 목록 조회
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/models")
    public ApiResponse<java.util.List<ModelVersionDto>> getDistinctModels() {
        return ApiResponse.success(adminService.getDistinctModels());
    }

    // H-007: 실패한 예측 요청 모니터링
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/requests/failed")
    public ApiResponse<Page<PredictionRequestResponseDto>> getFailedRequests(Pageable pageable) {
        return ApiResponse.success(adminService.getFailedRequests(pageable));
    }
}
