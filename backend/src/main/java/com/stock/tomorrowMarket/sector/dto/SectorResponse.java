package com.stock.tomorrowMarket.sector.dto;

import com.stock.tomorrowMarket.sector.entity.Sector;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SectorResponse {

    private Long sectorId;
    private String name;

    public static SectorResponse from(Sector sector) {
        return SectorResponse.builder()
                .sectorId(sector.getSectorsId())
                .name(sector.getName())
                .build();
    }
}
