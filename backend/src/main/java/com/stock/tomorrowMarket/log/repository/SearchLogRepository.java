package com.stock.tomorrowMarket.log.repository;

import com.stock.tomorrowMarket.log.entity.SearchLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface SearchLogRepository extends JpaRepository<SearchLog, Long> {

    // IDX_SEARCH_LOG_USER_TIME (USERS_ID, SEARCH_TIME DESC, STOCK_ID)
    Page<SearchLog> findByUser_UsersIdOrderBySearchTimeDesc(Long usersId, Pageable pageable);

    // IDX_SEARCH_LOG_TIME_STOCK (SEARCH_TIME, STOCK_ID)
    Page<SearchLog> findBySearchTimeBetween(LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);
}
