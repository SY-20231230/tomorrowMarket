package com.stock.tomorrowMarket.log.repository;

import com.stock.tomorrowMarket.log.entity.AccessLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface AccessLogRepository extends JpaRepository<AccessLog, Long> {

    // IDX_ACCESS_LOG_TIME (ACCESS_TIME)
    Long countByAccessTimeBetween(LocalDateTime startTime, LocalDateTime endTime);

    // IDX_ACCESS_LOG_SOURCE_TIME (SOURCE_TYPE, ACCESS_TIME)
    Long countBySourceTypeAndAccessTimeBetween(String sourceType, LocalDateTime startTime, LocalDateTime endTime);
}
