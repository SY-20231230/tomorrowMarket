package com.stock.tomorrowMarket.interest.service;

import com.stock.tomorrowMarket.interest.dto.SectorInterestResponse;
import com.stock.tomorrowMarket.interest.entity.SectorInterest;
import com.stock.tomorrowMarket.interest.repository.SectorInterestRepository;
import com.stock.tomorrowMarket.sector.entity.Sector;
import com.stock.tomorrowMarket.sector.repository.SectorRepository;
import com.stock.tomorrowMarket.user.entity.Users;
import com.stock.tomorrowMarket.user.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SectorInterestService {

    private final SectorInterestRepository sectorInterestRepository;
    private final UsersRepository usersRepository;
    private final SectorRepository sectorRepository;

    public List<SectorInterestResponse> getUserSectorInterests(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        return sectorInterestRepository.findByUser(user).stream()
                .map(SectorInterestResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public void addSectorInterest(Long userId, Long sectorId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        
        Sector sector = sectorRepository.findById(sectorId)
                .orElseThrow(() -> new IllegalArgumentException("Sector not found with id: " + sectorId));

        if (sectorInterestRepository.existsByUserAndSector(user, sector)) {
            throw new IllegalStateException("Already interested in this sector");
        }

        SectorInterest interest = SectorInterest.builder()
                .user(user)
                .sector(sector)
                .build();

        sectorInterestRepository.save(interest);
    }

    @Transactional
    public void removeSectorInterest(Long userId, Long sectorId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        
        Sector sector = sectorRepository.findById(sectorId)
                .orElseThrow(() -> new IllegalArgumentException("Sector not found with id: " + sectorId));

        SectorInterest interest = sectorInterestRepository.findByUserAndSector(user, sector)
                .orElseThrow(() -> new IllegalArgumentException("Interest not found for this sector"));

        sectorInterestRepository.delete(interest);
    }
}
