package com.stock.tomorrowMarket.admin.controller;

import com.stock.tomorrowMarket.admin.dto.DashboardDto;
import com.stock.tomorrowMarket.admin.dto.UserResponseDto;
import com.stock.tomorrowMarket.admin.dto.UserStatusUpdateRequestDto;
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
}
