package com.stock.tomorrowMarket.admin.service;

import com.stock.tomorrowMarket.admin.dto.DashboardDto;
import com.stock.tomorrowMarket.admin.dto.UserResponseDto;
import com.stock.tomorrowMarket.global.exception.CustomException;
import com.stock.tomorrowMarket.global.exception.ErrorCode;
import com.stock.tomorrowMarket.log.repository.AccessLogRepository;
import com.stock.tomorrowMarket.prediction.repository.PredictionRepository;
import com.stock.tomorrowMarket.user.entity.Status;
import com.stock.tomorrowMarket.user.entity.Users;
import com.stock.tomorrowMarket.user.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UsersRepository usersRepository;
    private final PredictionRepository predictionRepository;
    private final AccessLogRepository accessLogRepository;

    // H-001: 대시보드 통계
    @Transactional(readOnly = true)
    public DashboardDto getDashboardStats() {
        long activeUsers = usersRepository.countByStatus(Status.ACTIVE);
        long totalPredictions = predictionRepository.count();
        
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        Long todayAccess = accessLogRepository.countByAccessTimeBetween(startOfDay, endOfDay);

        return DashboardDto.builder()
                .totalActiveUsers(activeUsers)
                .totalPredictions(totalPredictions)
                .todayAccessCount(todayAccess != null ? todayAccess : 0L)
                .build();
    }

    // H-002: 사용자 목록 조회
    @Transactional(readOnly = true)
    public Page<UserResponseDto> getUsers(Pageable pageable) {
        return usersRepository.findAll(pageable).map(UserResponseDto::from);
    }

    // H-003: 사용자 상태 변경
    @Transactional
    public UserResponseDto changeUserStatus(Long usersId, Status newStatus) {
        Users user = usersRepository.findById(usersId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        user.changeStatus(newStatus);
        return UserResponseDto.from(user);
    }

    // H-004: 사용자 상세 조회
    @Transactional(readOnly = true)
    public UserResponseDto getUserDetails(Long usersId) {
        Users user = usersRepository.findById(usersId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        return UserResponseDto.from(user);
    }
}
