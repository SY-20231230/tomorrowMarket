package com.stock.tomorrowMarket.interest.controller;

import com.stock.tomorrowMarket.global.security.CustomUserDetails;
import com.stock.tomorrowMarket.interest.dto.InterestCreateRequest;
import com.stock.tomorrowMarket.interest.dto.InterestUpdateRequest;
import com.stock.tomorrowMarket.interest.dto.SectorInterestResponse;
import com.stock.tomorrowMarket.interest.service.SectorInterestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.stock.tomorrowMarket.global.response.ApiResponse;

@RestController
@RequestMapping("/api/interests")
@RequiredArgsConstructor
@Tag(name = "Interest", description = "관심 산업군/종목 관리 API")
public class SectorInterestController {

    private final SectorInterestService sectorInterestService;

    @Operation(summary = "관심 산업군 목록 조회", description = "사용자가 등록한 관심 산업군 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<SectorInterestResponse>>> getSectorInterests(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<SectorInterestResponse> response = sectorInterestService.getUserSectorInterests(userDetails.getUsersId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "관심 산업군 등록", description = "특정 산업군을 관심 산업군으로 등록합니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<String>> addSectorInterest(
            @Valid @RequestBody InterestCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        sectorInterestService.addSectorInterest(userDetails.getUsersId(), request);
        return ResponseEntity.ok(ApiResponse.success("관심 산업군 등록 성공"));
    }

    @Operation(summary = "관심 산업군 관심도 수정", description = "등록된 관심 산업군의 관심도를 수정합니다.")
    @PatchMapping("/{interestId}")
    public ResponseEntity<ApiResponse<String>> updateSectorInterest(
            @PathVariable Long interestId,
            @Valid @RequestBody InterestUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        sectorInterestService.updateSectorInterest(userDetails.getUsersId(), interestId, request);
        return ResponseEntity.ok(ApiResponse.success("관심 산업군 수정 성공"));
    }

    @Operation(summary = "관심 산업군 해제", description = "등록된 관심 산업군을 해제합니다.")
    @DeleteMapping("/{interestId}")
    public ResponseEntity<ApiResponse<String>> removeSectorInterest(
            @PathVariable Long interestId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        sectorInterestService.removeSectorInterest(userDetails.getUsersId(), interestId);
        return ResponseEntity.ok(ApiResponse.success("관심 산업군 삭제 성공"));
    }
}
