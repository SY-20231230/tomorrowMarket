package com.stock.tomorrowMarket.watchlist.service;

import com.stock.tomorrowMarket.stock.entity.Stock;
import com.stock.tomorrowMarket.stock.repository.StockRepository;
import com.stock.tomorrowMarket.user.entity.Users;
import com.stock.tomorrowMarket.user.repository.UsersRepository;
import com.stock.tomorrowMarket.watchlist.dto.WatchlistResponse;
import com.stock.tomorrowMarket.watchlist.entity.Watchlist;
import com.stock.tomorrowMarket.watchlist.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final UsersRepository usersRepository;
    private final StockRepository stockRepository;

    public List<WatchlistResponse> getUserWatchlist(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        return watchlistRepository.findByUser(user).stream()
                .map(WatchlistResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public void addStockToWatchlist(Long userId, Long stockId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        
        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new IllegalArgumentException("Stock not found with id: " + stockId));

        if (watchlistRepository.existsByUserAndStock(user, stock)) {
            throw new IllegalStateException("Already in watchlist");
        }

        Watchlist watchlist = Watchlist.builder()
                .user(user)
                .stock(stock)
                .build();

        watchlistRepository.save(watchlist);
    }

    @Transactional
    public void removeStockFromWatchlist(Long userId, Long stockId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        
        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new IllegalArgumentException("Stock not found with id: " + stockId));

        Watchlist watchlist = watchlistRepository.findByUserAndStock(user, stock)
                .orElseThrow(() -> new IllegalArgumentException("Stock not found in watchlist"));

        watchlistRepository.delete(watchlist);
    }
}
