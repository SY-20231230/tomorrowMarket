package com.stock.tomorrowMarket.stock.repository;

import com.stock.tomorrowMarket.stock.entity.Stock;
import com.stock.tomorrowMarket.stock.entity.StockHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StockHistoryRepository extends JpaRepository<StockHistory, Long> {
    
    Optional<StockHistory> findFirstByStockOrderByHistoryDateDesc(Stock stock);

    List<StockHistory> findByStockAndHistoryDateBetweenOrderByHistoryDateAsc(Stock stock, LocalDate startDate, LocalDate endDate);
}
