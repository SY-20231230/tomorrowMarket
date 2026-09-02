package com.stock.tomorrowMarket.interest.dto;

import com.stock.tomorrowMarket.interest.entity.SectorInterest;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SectorInterestResponse {

    private Long interestId;
    private Long sectorId;
    private String sectorName;
    private Byte level;
    private LocalDateTime createdAt;

    public static SectorInterestResponse from(SectorInterest interest) {
        return SectorInterestResponse.builder()
                .interestId(interest.getInterestId())
                .sectorId(interest.getSector().getSectorsId())
                .sectorName(interest.getSector().getName())
                .level(interest.getLevel())
                .createdAt(interest.getCreatedAt())
                .build();
    }
}
