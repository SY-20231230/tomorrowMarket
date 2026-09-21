package com.stock.tomorrowMarket.sector.controller;

import com.stock.tomorrowMarket.global.response.ApiResponse;
import com.stock.tomorrowMarket.sector.dto.SectorResponse;
import com.stock.tomorrowMarket.sector.service.SectorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sectors")
@RequiredArgsConstructor
@Tag(name = "Sector", description = "산업군(섹터) 정보 API")
public class SectorController {

    private final SectorService sectorService;

    @Operation(summary = "전체 산업군 목록 조회", description = "DB에 등록된 전체 산업군 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<SectorResponse>>> getAllSectors() {
        List<SectorResponse> response = sectorService.getAllSectors();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
