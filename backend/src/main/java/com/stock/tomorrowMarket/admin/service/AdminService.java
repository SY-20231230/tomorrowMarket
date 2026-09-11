package com.stock.tomorrowMarket.admin.service;

import com.stock.tomorrowMarket.admin.dto.AdminStockResponseDto;
import com.stock.tomorrowMarket.admin.dto.ModelVersionDto;
import com.stock.tomorrowMarket.admin.dto.DashboardDto;
import com.stock.tomorrowMarket.admin.dto.UserResponseDto;
import com.stock.tomorrowMarket.global.exception.CustomException;
import com.stock.tomorrowMarket.global.exception.ErrorCode;
import com.stock.tomorrowMarket.log.repository.AccessLogRepository;
import com.stock.tomorrowMarket.prediction.dto.PredictionRequestResponseDto;
import com.stock.tomorrowMarket.prediction.entity.RequestStatus;
import com.stock.tomorrowMarket.prediction.repository.PredictionRequestRepository;
import com.stock.tomorrowMarket.prediction.repository.PredictionRunRepository;
import com.stock.tomorrowMarket.prediction.repository.PredictionRepository;
import com.stock.tomorrowMarket.stock.entity.Stock;
import com.stock.tomorrowMarket.stock.repository.StockRepository;
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
    private final StockRepository stockRepository;
    private final PredictionRunRepository predictionRunRepository;
    private final PredictionRequestRepository predictionRequestRepository;

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

    // H-005: 종목 관리 (목록 조회)
    @Transactional(readOnly = true)
    public Page<AdminStockResponseDto> getStocks(Pageable pageable) {
        return stockRepository.findAll(pageable).map(AdminStockResponseDto::from);
    }

    // H-005: 종목 관리 (활성화 상태 변경)
    @Transactional
    public AdminStockResponseDto changeStockStatus(Long stockId, boolean isActive) {
        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new CustomException(ErrorCode.STOCK_NOT_FOUND));
        stock.changeActiveStatus(isActive);
        return AdminStockResponseDto.from(stock);
    }

    // H-006: 모델 버전 관리 (과거 실행된 모델 버전 목록)
    @Transactional(readOnly = true)
    public java.util.List<ModelVersionDto> getDistinctModels() {
        return predictionRunRepository.findDistinctModels().stream()
                .map(obj -> ModelVersionDto.builder()
                        .modelName((String) obj[0])
                        .modelVersion((String) obj[1])
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }

    // H-007: 유저 예측 요청 실패 내역 모니터링
    @Transactional(readOnly = true)
    public Page<PredictionRequestResponseDto> getFailedRequests(Pageable pageable) {
        return predictionRequestRepository.findByRequestStatusOrderByRequestedAtDesc(RequestStatus.FAILED, pageable)
                .map(PredictionRequestResponseDto::from);
    }
}
