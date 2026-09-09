package com.stock.tomorrowMarket.prediction.repository;

import com.stock.tomorrowMarket.prediction.entity.PredictionRequest;
import com.stock.tomorrowMarket.prediction.entity.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PredictionRequestRepository extends JpaRepository<PredictionRequest, Long> {

    // IDX_PREDICTION_REQUESTS_USER_STATUS_TIME (USERS_ID, REQUEST_STATUS, REQUESTED_AT DESC)
    Page<PredictionRequest> findByUser_UsersIdAndRequestStatusOrderByRequestedAtDesc(Long usersId, RequestStatus status, Pageable pageable);

    // IDX_PREDICTION_REQUESTS_STOCK_STATUS_TIME (STOCK_ID, REQUEST_STATUS, REQUESTED_AT DESC)
    Page<PredictionRequest> findByStock_StockIdAndRequestStatusOrderByRequestedAtDesc(Long stockId, RequestStatus status, Pageable pageable);
}

