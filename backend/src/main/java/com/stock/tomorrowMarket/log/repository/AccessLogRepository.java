package com.stock.tomorrowMarket.log.repository;

import com.stock.tomorrowMarket.log.entity.AccessLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AccessLogRepository extends JpaRepository<AccessLog, Long> {

    // IDX_ACCESS_LOG_TIME (ACCESS_TIME)
    Long countByAccessTimeBetween(LocalDateTime startTime, LocalDateTime endTime);

    // IDX_ACCESS_LOG_SOURCE_TIME (SOURCE_TYPE, ACCESS_TIME)
    Long countBySourceTypeAndAccessTimeBetween(String sourceType, LocalDateTime startTime, LocalDateTime endTime);

    // Group by source type
    @Query("SELECT a.sourceType, COUNT(a) FROM AccessLog a WHERE a.accessTime BETWEEN :startTime AND :endTime GROUP BY a.sourceType")
    List<Object[]> countBySourceTypeGrouped(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
}
