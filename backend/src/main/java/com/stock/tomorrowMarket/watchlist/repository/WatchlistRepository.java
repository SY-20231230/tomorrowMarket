package com.stock.tomorrowMarket.watchlist.repository;

import com.stock.tomorrowMarket.stock.entity.Stock;
import com.stock.tomorrowMarket.user.entity.Users;
import com.stock.tomorrowMarket.watchlist.entity.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {

    List<Watchlist> findByUser(Users user);

    Optional<Watchlist> findByUserAndStock(Users user, Stock stock);

    boolean existsByUserAndStock(Users user, Stock stock);
}
