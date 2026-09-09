package com.stock.tomorrowMarket.interest.controller;

import com.stock.tomorrowMarket.interest.dto.SectorInterestResponse;
import com.stock.tomorrowMarket.interest.service.SectorInterestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interests/sectors")
@RequiredArgsConstructor
@Tag(name = "Interest", description = "관심 산업군/종목 관리 API")
public class SectorInterestController {

    private final SectorInterestService sectorInterestService;

    @Operation(summary = "관심 산업군 목록 조회", description = "사용자가 등록한 관심 산업군 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<List<SectorInterestResponse>> getSectorInterests(
            @RequestParam(defaultValue = "1") Long userId // 임시 모킹 유저 아이디
    ) {
        List<SectorInterestResponse> response = sectorInterestService.getUserSectorInterests(userId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "관심 산업군 등록", description = "특정 산업군을 관심 산업군으로 등록합니다.")
    @PostMapping("/{sectorId}")
    public ResponseEntity<Void> addSectorInterest(
            @PathVariable Long sectorId,
            @RequestParam(defaultValue = "1") Long userId // 임시 모킹 유저 아이디
    ) {
        sectorInterestService.addSectorInterest(userId, sectorId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "관심 산업군 해제", description = "등록된 관심 산업군을 해제합니다.")
    @DeleteMapping("/{sectorId}")
    public ResponseEntity<Void> removeSectorInterest(
            @PathVariable Long sectorId,
            @RequestParam(defaultValue = "1") Long userId // 임시 모킹 유저 아이디
    ) {
        sectorInterestService.removeSectorInterest(userId, sectorId);
        return ResponseEntity.ok().build();
    }
}
