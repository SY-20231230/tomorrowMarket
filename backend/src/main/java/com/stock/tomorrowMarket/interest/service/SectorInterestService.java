package com.stock.tomorrowMarket.interest.service;

import com.stock.tomorrowMarket.global.exception.CustomException;
import com.stock.tomorrowMarket.global.exception.ErrorCode;
import com.stock.tomorrowMarket.interest.dto.InterestCreateRequest;
import com.stock.tomorrowMarket.interest.dto.InterestUpdateRequest;
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
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        return sectorInterestRepository.findByUser(user).stream()
                .map(SectorInterestResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public void addSectorInterest(Long userId, InterestCreateRequest request) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        
        Sector sector = sectorRepository.findById(request.sectorId())
                .orElseThrow(() -> new CustomException(ErrorCode.SECTOR_NOT_FOUND));

        if (sectorInterestRepository.existsByUserAndSector(user, sector)) {
            throw new CustomException(ErrorCode.DUPLICATE_INTEREST);
        }

        SectorInterest interest = SectorInterest.builder()
                .user(user)
                .sector(sector)
                .level(request.level())
                .build();

        sectorInterestRepository.save(interest);
    }

    @Transactional
    public void updateSectorInterest(Long userId, Long interestId, InterestUpdateRequest request) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        
        SectorInterest interest = sectorInterestRepository.findByInterestIdAndUser(interestId, user)
                .orElseThrow(() -> new CustomException(ErrorCode.SECTOR_NOT_FOUND)); // Or a new NOT_FOUND code for interest

        interest.updateLevel(request.level());
    }

    @Transactional
    public void removeSectorInterest(Long userId, Long interestId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        
        SectorInterest interest = sectorInterestRepository.findByInterestIdAndUser(interestId, user)
                .orElseThrow(() -> new CustomException(ErrorCode.SECTOR_NOT_FOUND));

        sectorInterestRepository.delete(interest);
    }
}
