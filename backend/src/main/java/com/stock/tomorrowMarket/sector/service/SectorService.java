package com.stock.tomorrowMarket.sector.service;

import com.stock.tomorrowMarket.sector.dto.SectorResponse;
import com.stock.tomorrowMarket.sector.repository.SectorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SectorService {

    private final SectorRepository sectorRepository;

    public List<SectorResponse> getAllSectors() {
        return sectorRepository.findAll().stream()
                .map(SectorResponse::from)
                .collect(Collectors.toList());
    }
}
