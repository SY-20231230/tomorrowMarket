package com.stock.tomorrowMarket.log.repository;

import com.stock.tomorrowMarket.log.entity.SearchLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SearchLogRepository extends JpaRepository<SearchLog, Long> {

    // IDX_SEARCH_LOG_USER_TIME (USERS_ID, SEARCH_TIME DESC, STOCK_ID)
    Page<SearchLog> findByUser_UsersIdOrderBySearchTimeDesc(Long usersId, Pageable pageable);

    // IDX_SEARCH_LOG_TIME_STOCK (SEARCH_TIME, STOCK_ID)
    Page<SearchLog> findBySearchTimeBetween(LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);

    // Group by stock and get top searched
    @Query("SELECT s.stock.stockId, s.stock.stockName, COUNT(s) FROM SearchLog s WHERE s.searchTime BETWEEN :startTime AND :endTime GROUP BY s.stock.stockId, s.stock.stockName ORDER BY COUNT(s) DESC")
    List<Object[]> findTopSearchedStocksWithDetails(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime, Pageable pageable);
}
