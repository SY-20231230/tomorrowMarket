package com.stock.tomorrowMarket.user.controller;

import com.stock.tomorrowMarket.global.response.ApiResponse;
import com.stock.tomorrowMarket.global.security.CustomUserDetails;
import com.stock.tomorrowMarket.prediction.entity.RequestStatus;
import com.stock.tomorrowMarket.stock.dto.StockResponse;
import com.stock.tomorrowMarket.user.dto.PasswordChangeRequest;
import com.stock.tomorrowMarket.user.dto.UserPredictionRequestResponse;
import com.stock.tomorrowMarket.user.dto.UserResponse;
import com.stock.tomorrowMarket.user.dto.UserUpdateRequest;
import com.stock.tomorrowMarket.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User", description = "사용자 마이페이지 및 설정 API")
public class UserController {

    private final UserService userService;

    @Operation(summary = "내 정보 조회", description = "로그인한 사용자의 프로필 정보를 조회합니다.")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMyInfo(@AuthenticationPrincipal CustomUserDetails userDetails) {
        UserResponse response = userService.getMyInfo(userDetails.getUsersId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateMyInfo(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UserUpdateRequest request) {
        UserResponse response = userService.updateMyInfo(userDetails.getUsersId(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "비밀번호 변경", description = "기존 비밀번호를 확인하고 새 비밀번호로 변경합니다.")
    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody PasswordChangeRequest request) {
        userService.changePassword(userDetails.getUsersId(), request);
        return ResponseEntity.ok(ApiResponse.success("비밀번호 변경 성공"));
    }

    @Operation(summary = "회원 탈퇴", description = "회원 상태를 탈퇴(WITHDRAWN)로 변경합니다.")
    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<String>> withdraw(@AuthenticationPrincipal CustomUserDetails userDetails) {
        userService.withdraw(userDetails.getUsersId());
        return ResponseEntity.ok(ApiResponse.success("회원 탈퇴 성공"));
    }
}
