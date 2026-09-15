package com.stock.tomorrowMarket.user.service;

import com.stock.tomorrowMarket.global.exception.CustomException;
import com.stock.tomorrowMarket.global.exception.ErrorCode;
import com.stock.tomorrowMarket.log.service.SearchLogService;
import com.stock.tomorrowMarket.prediction.entity.PredictionRequest;
import com.stock.tomorrowMarket.prediction.entity.RequestStatus;
import com.stock.tomorrowMarket.prediction.repository.PredictionRequestRepository;
import com.stock.tomorrowMarket.stock.dto.StockResponse;
import com.stock.tomorrowMarket.user.dto.PasswordChangeRequest;
import com.stock.tomorrowMarket.user.dto.UserPredictionRequestResponse;
import com.stock.tomorrowMarket.user.dto.UserResponse;
import com.stock.tomorrowMarket.user.dto.UserUpdateRequest;
import com.stock.tomorrowMarket.user.entity.Status;
import com.stock.tomorrowMarket.user.entity.Users;
import com.stock.tomorrowMarket.user.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;
    private final SearchLogService searchLogService;
    private final PredictionRequestRepository predictionRequestRepository;

    @Transactional(readOnly = true)
    public UserResponse getMyInfo(Long usersId) {
        Users user = usersRepository.findById(usersId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse updateMyInfo(Long usersId, UserUpdateRequest request) {
        Users user = usersRepository.findById(usersId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        user.updateInfo(request.name(), request.birthdate());
        return UserResponse.from(user);
    }

    @Transactional
    public void changePassword(Long usersId, PasswordChangeRequest request) {
        Users user = usersRepository.findById(usersId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_PASSWORD);
        }

        user.updatePassword(passwordEncoder.encode(request.newPassword()));
    }

    @Transactional
    public void withdraw(Long usersId) {
        Users user = usersRepository.findById(usersId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        user.changeStatus(Status.WITHDRAWN);
    }

    @Transactional(readOnly = true)
    public List<StockResponse> getRecentStocks(Long usersId, int limit) {
        return searchLogService.getRecentStocks(usersId, limit);
    }

    @Transactional(readOnly = true)
    public Page<UserPredictionRequestResponse> getMyPredictionRequests(Long usersId, RequestStatus status, Pageable pageable) {
        Page<PredictionRequest> requests;
        if (status != null) {
            requests = predictionRequestRepository.findByUser_UsersIdAndRequestStatusOrderByRequestedAtDesc(usersId, status, pageable);
        } else {
            requests = predictionRequestRepository.findByUser_UsersIdOrderByRequestedAtDesc(usersId, pageable);
        }
        return requests.map(UserPredictionRequestResponse::from);
    }
}
